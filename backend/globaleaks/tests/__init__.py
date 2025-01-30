import logging
import os.path

from globaleaks.settings import Settings

Settings.loglevel = logging.DEBUG
TEST_DIR = os.path.dirname(__file__)
