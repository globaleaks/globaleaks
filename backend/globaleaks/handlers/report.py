# Handlers dealing with user support requests
from globaleaks.handlers.base import BaseHandler
from globaleaks.rest import requests
from globaleaks.settings import Settings


class ReportHandler(BaseHandler):
    """
    This handler is responsible of receiving CSP violation reports
    """
    check_roles = 'any'

    def post(self):
        request = self.request.content.read()
        self.state.csp_report_log.write(request)
