-- Extend User.status for temporary account block (cannot sign in until restored).
ALTER TABLE `User`
  MODIFY COLUMN `status` ENUM('ACTIVE', 'INVITED', 'DISABLED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE';

-- CRM customer lifecycle: active, temporarily blocked, or deactivated (soft-remove).
ALTER TABLE `Customer`
  ADD COLUMN `accountStatus` ENUM('ACTIVE', 'BLOCKED', 'DEACTIVATED') NOT NULL DEFAULT 'ACTIVE';
