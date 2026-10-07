-- 003: allow 'pending_review' tracking status (used when a clip's author
-- can't be auto-matched to a verified account, e.g. Instagram reels)
alter type tracking_status add value if not exists 'pending_review';
