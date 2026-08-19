INSERT IGNORE INTO _console_teams (_uid, _createdAt, _updatedAt, _permissions, `keys`, name, total, search, prefs, labels) 
VALUES ('console-main', NOW(3), NOW(3), '[]', '{}', 'Console', 1, '', '{}', '[]');

INSERT INTO _console_memberships (_uid, _createdAt, _updatedAt, _permissions, userInternalId, userId, teamInternalId, teamId, roles, invited, joined, confirm, secret, search) 
VALUES ('console-admin-mbr', NOW(3), NOW(3), '[]', 1, 'admin-horizon-1786976717844', 1, 'console-main', '["admin"]', NOW(3), NOW(3), 1, '', '');

-- Also update user to verify email
UPDATE _console_users SET emailVerification = 1 WHERE _uid = 'admin-horizon-1786976717844';

-- Verify
SELECT 'Teams:' as info;
SELECT _uid, name FROM _console_teams;
SELECT 'Memberships:' as info;
SELECT userInternalId, teamInternalId, roles, confirm FROM _console_memberships;
SELECT 'Users:' as info;
SELECT _uid, email, emailVerification FROM _console_users;
