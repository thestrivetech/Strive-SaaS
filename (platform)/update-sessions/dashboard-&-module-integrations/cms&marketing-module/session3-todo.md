# Session 3 TODO: Media Library - Upload & Management

**Created:** 2025-10-05
**Session Plan:** session3.plan.md
**Status:** IN PROGRESS

---

## 🎯 SESSION OBJECTIVES

- [ ] **OBJ-1:** Create media module backend structure
- [ ] **OBJ-2:** Implement Supabase Storage integration
- [ ] **OBJ-3:** Build file upload with validation
- [ ] **OBJ-4:** Create folder management system
- [ ] **OBJ-5:** Implement image optimization
- [ ] **OBJ-6:** Build media library UI
- [ ] **OBJ-7:** Add drag-and-drop upload
- [ ] **OBJ-8:** Create media picker component

---

## 📁 BACKEND IMPLEMENTATION

### Media Schemas (schemas.ts)
- [ ] **SCHEMA-1:** Create MediaAssetSchema (name, fileName, fileUrl, mimeType, fileSize, dimensions)
- [ ] **SCHEMA-2:** Create MediaFolderSchema (name, parentId, path)
- [ ] **SCHEMA-3:** Create MediaFiltersSchema (folderId, mimeType, search, pagination)
- [ ] **SCHEMA-4:** Define ALLOWED_IMAGE_TYPES (jpeg, png, gif, webp, svg)
- [ ] **SCHEMA-5:** Define ALLOWED_VIDEO_TYPES (mp4, webm, ogg)
- [ ] **SCHEMA-6:** Define ALLOWED_DOCUMENT_TYPES (pdf, docx)
- [ ] **SCHEMA-7:** Export TypeScript types from schemas

### Upload Helper (upload.ts)
- [ ] **UPLOAD-1:** Create uploadToSupabase() function
- [ ] **UPLOAD-2:** Generate unique filenames (orgId/folder/timestamp-filename)
- [ ] **UPLOAD-3:** Convert File to Buffer for processing
- [ ] **UPLOAD-4:** Implement optimizeImage() with sharp
- [ ] **UPLOAD-5:** Resize images to max 2000px width
- [ ] **UPLOAD-6:** Convert images to WebP (except GIFs)
- [ ] **UPLOAD-7:** Upload to Supabase Storage bucket 'content-media'
- [ ] **UPLOAD-8:** Get public URL from Supabase
- [ ] **UPLOAD-9:** Return UploadResult with fileName, fileUrl, dimensions
- [ ] **UPLOAD-10:** Create deleteFromSupabase() function
- [ ] **UPLOAD-11:** Add proper error handling for upload failures

### Media Actions (actions.ts)
- [ ] **ACTION-1:** Implement uploadMediaAsset() Server Action
- [ ] **ACTION-2:** Validate RBAC with canAccessContent()
- [ ] **ACTION-3:** Extract file, folderId, alt, caption from FormData
- [ ] **ACTION-4:** Call uploadToSupabase() helper
- [ ] **ACTION-5:** Save media asset to database with organizationId
- [ ] **ACTION-6:** Revalidate '/content/library' path
- [ ] **ACTION-7:** Return created asset with relations
- [ ] **ACTION-8:** Implement createMediaFolder() Server Action
- [ ] **ACTION-9:** Build folder path with parent support
- [ ] **ACTION-10:** Validate folder name uniqueness per org
- [ ] **ACTION-11:** Implement updateMediaAsset() Server Action
- [ ] **ACTION-12:** Update alt text, caption, name
- [ ] **ACTION-13:** Implement deleteMediaAsset() Server Action
- [ ] **ACTION-14:** Delete from Supabase Storage first
- [ ] **ACTION-15:** Delete from database after storage deletion
- [ ] **ACTION-16:** Implement deleteMediaFolder() Server Action
- [ ] **ACTION-17:** Check folder is empty before deletion
- [ ] **ACTION-18:** Prevent deletion of folders with subfolders

### Media Queries (queries.ts)
- [ ] **QUERY-1:** Implement getMediaAssets() with React cache
- [ ] **QUERY-2:** Filter by folderId (null for root folder)
- [ ] **QUERY-3:** Filter by mimeType (startsWith for type filtering)
- [ ] **QUERY-4:** Search by name, alt, caption
- [ ] **QUERY-5:** Include uploader relation
- [ ] **QUERY-6:** Include folder relation
- [ ] **QUERY-7:** Implement pagination (limit, offset)
- [ ] **QUERY-8:** Order by uploadedAt desc
- [ ] **QUERY-9:** Implement getMediaFolders() with React cache
- [ ] **QUERY-10:** Get folders by parentId
- [ ] **QUERY-11:** Include _count for assets and children
- [ ] **QUERY-12:** Order folders by name asc
- [ ] **QUERY-13:** Implement getFolderTree() with React cache
- [ ] **QUERY-14:** Build recursive folder tree structure
- [ ] **QUERY-15:** Map folders with parent-child relationships
- [ ] **QUERY-16:** Implement getMediaStats() with React cache
- [ ] **QUERY-17:** Count total assets
- [ ] **QUERY-18:** Aggregate total file size
- [ ] **QUERY-19:** Count images (mimeType startsWith 'image/')
- [ ] **QUERY-20:** Count videos (mimeType startsWith 'video/')
- [ ] **QUERY-21:** Count documents (mimeType startsWith 'application/')

### Module Public API (index.ts)
- [ ] **API-1:** Export all schemas (MediaAssetSchema, MediaFolderSchema, MediaFiltersSchema)
- [ ] **API-2:** Export all types (MediaAssetInput, MediaFolderInput, MediaFilters)
- [ ] **API-3:** Export file type constants (ALLOWED_IMAGE_TYPES, etc.)
- [ ] **API-4:** Export upload helpers (uploadToSupabase, deleteFromSupabase)
- [ ] **API-5:** Export all actions (uploadMediaAsset, createMediaFolder, etc.)
- [ ] **API-6:** Export all queries (getMediaAssets, getMediaFolders, etc.)
- [ ] **API-7:** Export Prisma types (MediaAsset, MediaFolder)

---

## 🎨 FRONTEND IMPLEMENTATION

### Media Library Main Component (media-library.tsx)
- [ ] **UI-LIB-1:** Create MediaLibrary component with sidebar layout
- [ ] **UI-LIB-2:** Add folder tree sidebar (w-64)
- [ ] **UI-LIB-3:** Add main content area with upload zone
- [ ] **UI-LIB-4:** Add search input with icon
- [ ] **UI-LIB-5:** Add view mode tabs (grid vs list)
- [ ] **UI-LIB-6:** Add folder creation button
- [ ] **UI-LIB-7:** Implement selectedFolder state
- [ ] **UI-LIB-8:** Implement search state
- [ ] **UI-LIB-9:** Filter assets by selected folder and search
- [ ] **UI-LIB-10:** Pass filtered assets to MediaGrid

### Upload Zone Component (media-upload-zone.tsx)
- [ ] **UI-UPLOAD-1:** Create MediaUploadZone component
- [ ] **UI-UPLOAD-2:** Integrate react-dropzone for drag-drop
- [ ] **UI-UPLOAD-3:** Configure accepted file types (images, videos, PDFs)
- [ ] **UI-UPLOAD-4:** Set max file size to 50MB
- [ ] **UI-UPLOAD-5:** Implement onDrop handler
- [ ] **UI-UPLOAD-6:** Loop through files and upload each
- [ ] **UI-UPLOAD-7:** Show uploading state with Loader2 icon
- [ ] **UI-UPLOAD-8:** Show drag active state with border highlight
- [ ] **UI-UPLOAD-9:** Call router.refresh() after upload
- [ ] **UI-UPLOAD-10:** Show success toast after upload
- [ ] **UI-UPLOAD-11:** Show error toast on upload failure
- [ ] **UI-UPLOAD-12:** Disable zone during upload

### Media Grid Component (media-grid.tsx)
- [ ] **UI-GRID-1:** Create MediaGrid component
- [ ] **UI-GRID-2:** Support grid view mode
- [ ] **UI-GRID-3:** Support list view mode
- [ ] **UI-GRID-4:** Map assets to MediaCard components
- [ ] **UI-GRID-5:** Show empty state when no assets
- [ ] **UI-GRID-6:** Add responsive grid layout (grid-cols-2 md:grid-cols-4 lg:grid-cols-6)

### Media Card Component (media-card.tsx)
- [ ] **UI-CARD-1:** Create MediaCard component
- [ ] **UI-CARD-2:** Show image thumbnail for image assets
- [ ] **UI-CARD-3:** Show video icon for video assets
- [ ] **UI-CARD-4:** Show document icon for document assets
- [ ] **UI-CARD-5:** Display asset name
- [ ] **UI-CARD-6:** Display file size (formatted)
- [ ] **UI-CARD-7:** Display dimensions for images
- [ ] **UI-CARD-8:** Add hover actions (view, download, delete)
- [ ] **UI-CARD-9:** Add selected state styling
- [ ] **UI-CARD-10:** Implement card click handler

### Folder Tree Component (media-folder-tree.tsx)
- [ ] **UI-TREE-1:** Create MediaFolderTree component
- [ ] **UI-TREE-2:** Display root "All Media" folder
- [ ] **UI-TREE-3:** Recursively render folder children
- [ ] **UI-TREE-4:** Show asset count per folder
- [ ] **UI-TREE-5:** Highlight selected folder
- [ ] **UI-TREE-6:** Implement folder click handler
- [ ] **UI-TREE-7:** Show folder expand/collapse icons
- [ ] **UI-TREE-8:** Add folder creation dialog

### Media Details Panel (media-details-panel.tsx)
- [ ] **UI-DETAILS-1:** Create MediaDetailsPanel component
- [ ] **UI-DETAILS-2:** Show large preview of selected asset
- [ ] **UI-DETAILS-3:** Display asset metadata (name, size, dimensions, uploaded by, upload date)
- [ ] **UI-DETAILS-4:** Add alt text editor
- [ ] **UI-DETAILS-5:** Add caption editor
- [ ] **UI-DETAILS-6:** Add folder selector
- [ ] **UI-DETAILS-7:** Add save changes button
- [ ] **UI-DETAILS-8:** Add delete button with confirmation
- [ ] **UI-DETAILS-9:** Show public URL with copy button

### Media Picker Dialog (media-picker-dialog.tsx)
- [ ] **UI-PICKER-1:** Create MediaPickerDialog component
- [ ] **UI-PICKER-2:** Show dialog with media library
- [ ] **UI-PICKER-3:** Support single selection mode
- [ ] **UI-PICKER-4:** Support multiple selection mode
- [ ] **UI-PICKER-5:** Show selected assets with checkmarks
- [ ] **UI-PICKER-6:** Add "Select" button to confirm
- [ ] **UI-PICKER-7:** Add "Cancel" button to close
- [ ] **UI-PICKER-8:** Return selected assets to parent
- [ ] **UI-PICKER-9:** Support upload within picker

---

## 🔧 DEPENDENCIES

- [ ] **DEP-1:** Install sharp (npm install sharp)
- [ ] **DEP-2:** Install react-dropzone (npm install react-dropzone)
- [ ] **DEP-3:** Verify @supabase/supabase-js installed
- [ ] **DEP-4:** Create Supabase Storage bucket 'content-media'
- [ ] **DEP-5:** Configure bucket as public
- [ ] **DEP-6:** Set bucket RLS policies

---

## ✅ VALIDATION & TESTING

- [ ] **TEST-1:** Create __tests__/modules/content/media.test.ts
- [ ] **TEST-2:** Test uploadToSupabase() function
- [ ] **TEST-3:** Test deleteFromSupabase() function
- [ ] **TEST-4:** Test optimizeImage() function
- [ ] **TEST-5:** Test createMediaFolder() action
- [ ] **TEST-6:** Test uploadMediaAsset() action
- [ ] **TEST-7:** Test updateMediaAsset() action
- [ ] **TEST-8:** Test deleteMediaAsset() action
- [ ] **TEST-9:** Test getMediaAssets() query
- [ ] **TEST-10:** Test getFolderTree() query
- [ ] **TEST-11:** Test getMediaStats() query
- [ ] **TEST-12:** Test RBAC enforcement (canAccessContent)
- [ ] **TEST-13:** Test multi-tenancy isolation
- [ ] **TEST-14:** Test file type validation
- [ ] **TEST-15:** Test file size limits (50MB max)
- [ ] **TEST-16:** Test image optimization (resize, WebP conversion)
- [ ] **TEST-17:** Test folder path building
- [ ] **TEST-18:** Test folder tree structure building

### TypeScript Validation
- [ ] **TS-1:** Run `npx tsc --noEmit` - zero errors
- [ ] **TS-2:** Verify all media types exported
- [ ] **TS-3:** Verify Prisma types match database

### Linting
- [ ] **LINT-1:** Run `npm run lint` - zero warnings
- [ ] **LINT-2:** Check all files under 500 lines

### Manual Testing
- [ ] **MANUAL-1:** Upload image file - verify optimization
- [ ] **MANUAL-2:** Upload video file - verify storage
- [ ] **MANUAL-3:** Upload PDF file - verify storage
- [ ] **MANUAL-4:** Create folder - verify in database
- [ ] **MANUAL-5:** Move asset to folder - verify update
- [ ] **MANUAL-6:** Delete asset - verify Supabase deletion
- [ ] **MANUAL-7:** Delete folder - verify empty check
- [ ] **MANUAL-8:** Search media - verify filtering
- [ ] **MANUAL-9:** Test drag-drop upload
- [ ] **MANUAL-10:** Test media picker selection

---

## 🔒 SECURITY CHECKS

- [ ] **SEC-1:** Verify multi-tenancy isolation (organizationId filtering)
- [ ] **SEC-2:** Verify RBAC enforcement (canAccessContent)
- [ ] **SEC-3:** Verify file type validation (whitelist only)
- [ ] **SEC-4:** Verify file size limits (50MB max)
- [ ] **SEC-5:** Verify filename sanitization (no path traversal)
- [ ] **SEC-6:** Verify Supabase Storage permissions (org-scoped)
- [ ] **SEC-7:** Verify no SQL injection in queries
- [ ] **SEC-8:** Verify input validation with Zod
- [ ] **SEC-9:** Verify SUPABASE_SERVICE_ROLE_KEY not exposed to client
- [ ] **SEC-10:** Verify folder deletion safety (check for contents)

---

## 📊 SUCCESS CRITERIA

- [ ] **SUCCESS-1:** All backend files created (5 files)
- [ ] **SUCCESS-2:** All frontend components created (7 files)
- [ ] **SUCCESS-3:** All tests passing (80%+ coverage)
- [ ] **SUCCESS-4:** TypeScript zero errors
- [ ] **SUCCESS-5:** Linting zero warnings
- [ ] **SUCCESS-6:** All files under 500 lines
- [ ] **SUCCESS-7:** Media upload functional
- [ ] **SUCCESS-8:** Image optimization working
- [ ] **SUCCESS-9:** Folder management working
- [ ] **SUCCESS-10:** Drag-drop upload working
- [ ] **SUCCESS-11:** Multi-tenancy verified
- [ ] **SUCCESS-12:** RBAC verified
- [ ] **SUCCESS-13:** Supabase Storage integration working
- [ ] **SUCCESS-14:** Media picker working
- [ ] **SUCCESS-15:** Session summary created

---

## 🚫 BLOCKING CRITERIA

**DO NOT report session complete unless ALL of the following are TRUE:**

1. ✅ All 5 backend files created (schemas.ts, upload.ts, actions.ts, queries.ts, index.ts)
2. ✅ All 7 frontend components created (media-library, upload-zone, grid, card, folder-tree, details-panel, picker)
3. ✅ Dependencies installed (sharp, react-dropzone)
4. ✅ Supabase Storage bucket 'content-media' created and configured
5. ✅ TypeScript validation passes: `npx tsc --noEmit` returns ZERO errors
6. ✅ Linting passes: `npm run lint` returns ZERO warnings
7. ✅ All files under 500-line limit
8. ✅ Session summary file created: `session3-summary.md`
9. ✅ Summary includes verification command outputs
10. ✅ Tests written for media module (unit tests minimum)

---

**Total Tasks:** 160+
**Estimated Time:** 4-5 hours
**Session Status:** IN PROGRESS
