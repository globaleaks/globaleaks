# -*- coding: utf-8 -*-
from twisted.internet.defer import inlineCallbacks

from globaleaks.handlers import admin
from globaleaks.tests import helpers

# special guest:

stuff = "stuff"


class TestNotificationInstance(helpers.TestHandlerWithPopulatedDB):
    _handler = admin.notification.NotificationInstance

    @inlineCallbacks
    def test_get(self):
        handler = self.request(role='admin')
        response = yield handler.get()
        self.assertEqual(response['smtp_server'], 'mail.globaleaks.org')

    @inlineCallbacks
    def test_put(self):
        handler = self.request(role='admin')
        notif_desc = yield handler.get()

        notif_desc['smtp_server'] = stuff
        notif_desc['smtp_password'] = 'widdlyscuds'
        notif_desc['smtp2_authentication'] = False
        notif_desc['smtp2_enabled'] = False

        handler = self.request(notif_desc, role='admin')
        response = yield handler.put()
        self.assertEqual(response['smtp_server'], stuff)
