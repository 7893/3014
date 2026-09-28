import importlib.util
import io
from pathlib import Path
import tarfile
import tempfile
import unittest

spec = importlib.util.spec_from_file_location(
    "receiver", Path(__file__).resolve().parents[1] / "ops/receive.py"
)
receiver = importlib.util.module_from_spec(spec)
spec.loader.exec_module(receiver)


def bundle(extra=None, asset=None):
    stream = io.BytesIO()
    with tarfile.open(fileobj=stream, mode="w") as archive:
        for name in ["index.html", "LICENSE", "NOTICE", "assets/js/main.js"]:
            info = tarfile.TarInfo(name)
            info.size = 2
            archive.addfile(info, io.BytesIO(b"ok"))
        if extra:
            archive.addfile(extra)
        if asset:
            name, content = asset
            info = tarfile.TarInfo("assets/" + name)
            info.size = len(content)
            archive.addfile(info, io.BytesIO(content))
    return stream.getvalue()


class ReceiverTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        receiver.BASE = Path(self.temporary.name) / "site"
        (receiver.BASE / "releases").mkdir(parents=True)
        self.image = Path(self.temporary.name) / "existing.jpg"
        self.image.write_bytes(b"original image")

    def test_publish_and_reject_without_switching(self):
        receiver.publish(bundle())
        current = receiver.BASE / "current"
        release = current.resolve()
        self.assertEqual((current / "index.html").read_bytes(), b"ok")
        for name in ["../existing.jpg", "/tmp/escape", ".env", "assets/.env"]:
            with self.assertRaises(ValueError):
                receiver.publish(bundle(tarfile.TarInfo(name)))
            self.assertEqual(current.resolve(), release)
        for kind in [tarfile.SYMTYPE, tarfile.LNKTYPE, tarfile.FIFOTYPE]:
            info = tarfile.TarInfo("assets/link.js")
            info.type = kind
            info.linkname = "../../existing.jpg"
            with self.assertRaises(ValueError):
                receiver.publish(bundle(info))
        self.assertEqual(self.image.read_bytes(), b"original image")
        self.assertEqual(current.resolve(), release)

    def test_size_limit(self):
        with self.assertRaises(ValueError):
            receiver.publish(b"x" * (receiver.LIMIT + 1))
        self.assertFalse((receiver.BASE / "current").exists())

    def test_old_assets_survive_and_cannot_change(self):
        receiver.publish(bundle(asset=("main-abcdefgh.js", b"first")))
        receiver.publish(bundle(asset=("main-ijklmnop.js", b"second")))
        current = (receiver.BASE / "current").resolve()
        assets = receiver.BASE / "assets"
        self.assertEqual((assets / "main-abcdefgh.js").read_bytes(), b"first")
        self.assertEqual((assets / "main-ijklmnop.js").read_bytes(), b"second")
        with self.assertRaises(ValueError):
            receiver.publish(bundle(asset=("main-abcdefgh.js", b"different")))
        self.assertEqual((receiver.BASE / "current").resolve(), current)
        self.assertEqual((assets / "main-abcdefgh.js").read_bytes(), b"first")
        self.assertFalse((assets / "js/main.js").exists())


if __name__ == "__main__":
    unittest.main()
