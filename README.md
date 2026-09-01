# OT Case Log

A free, local-first single-page case log. Open `index.html` in a current browser, or publish this folder as a static site (for example GitHub Pages).

## What it does

- Records patient demographics, procedure, notes, clinical history, imaging, histopathology, outcomes, role, and complications.
- Stores uploaded pre-op and intra-op photos with the case in the browser database.
- Reads images and multi-page PDFs, then auto-fills labelled fields including patient details, procedure, date, clinical sections, role, and complications where the source contains those labels.
- Keeps pre-op, intra-op, and post-op/follow-up photos in separate categories; a dedicated document-photo upload can also run OCR.
- Exports and restores JSON backups.

## Privacy and clinical use

This is an early personal logbook, not a hospital record system. It has no login, server sync, encryption at rest, audit log, role-based access, or consent management. Keep it only on a private, access-controlled device; follow your hospital policy; obtain appropriate consent for clinical photographs; and never rely on OCR without verification. Use encrypted storage for exported backups.

## Install as an app

Open it in Chrome or Edge, then use the browser's **Install app** option. For OCR and PDF reading, the device must be online because the reader libraries are loaded from public CDNs.
