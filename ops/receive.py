#!/usr/local/bin/python3.12
"""Receive a bounded static archive through a forced SSH command."""
import hashlib
import io
import os
from pathlib import Path, PurePosixPath
import shutil
import sys
import tarfile
import tempfile

BASE = Path("/var/www/suizhou")
LIMIT = 20 * 1024 * 1024


def publish(data):
    if len(data) > LIMIT:
        raise ValueError("Archive exceeds limit")
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:") as archive:
        members = archive.getmembers()
        if len(members) > 1000 or sum(m.size for m in members) > LIMIT:
            raise ValueError("Expanded archive exceeds limit")
        names = set()
        for member in members:
            path = PurePosixPath(member.name)
            if path.is_absolute() or ".." in path.parts or not path.parts:
                raise ValueError("Invalid path")
            if not (member.isfile() or member.isdir()):
                raise ValueError("Links and special files are forbidden")
            if path.parts[0] == "assets":
                if any(part.startswith(".") for part in path.parts):
                    raise ValueError("Hidden asset")
                if member.isfile() and path.suffix not in {".js", ".css", ".woff2", ".txt"}:
                    raise ValueError("Unexpected asset type")
            elif member.name not in {"index.html", "LICENSE", "NOTICE", ".nojekyll"}:
                raise ValueError("Unexpected website file")
            elif not member.isfile():
                raise ValueError("Expected regular file")
            if member.name in names:
                raise ValueError("Duplicate archive entry")
            names.add(member.name)
        if not {"index.html", "LICENSE", "NOTICE"}.issubset(names):
            raise ValueError("Incomplete website")
        releases = BASE / "releases"
        release = releases / hashlib.sha256(data).hexdigest()
        temporary = Path(tempfile.mkdtemp(prefix=".incoming-", dir=releases))
        try:
            for member in members:
                destination = temporary / member.name
                if member.isdir():
                    destination.mkdir(parents=True, exist_ok=True)
                else:
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    with archive.extractfile(member) as source, destination.open("wb") as target:
                        shutil.copyfileobj(source, target)
                    destination.chmod(0o644)
            temporary.chmod(0o755)
            if not release.exists():
                temporary.rename(release)
        finally:
            if temporary.exists():
                shutil.rmtree(temporary)
    link = BASE / (".current-" + str(os.getpid()))
    try:
        link.symlink_to(release)
        link.replace(BASE / "current")
    finally:
        link.unlink(missing_ok=True)
    print("Published " + release.name)


if __name__ == "__main__":
    os.umask(0o022)
    publish(sys.stdin.buffer.read(LIMIT + 1))
