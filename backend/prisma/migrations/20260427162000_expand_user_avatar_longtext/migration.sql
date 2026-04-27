-- Expand avatar storage to support large base64 data URLs (up to 5MB uploads).
ALTER TABLE `User`
  MODIFY `avatarUrl` LONGTEXT NULL;
