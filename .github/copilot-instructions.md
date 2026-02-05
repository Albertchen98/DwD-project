# AI Coding Guidelines for DwD Project

## Project Overview
This is a research showcase website for **Driving with DINO (DwD)**, a sim-to-real video generation framework for autonomous driving that uses vision foundation features (DINOv3) to bridge the domain gap. The project demonstrates comparative results between simulation inputs and generated photorealistic driving videos.

## Architecture & Key Components

### Frontend Stack
- **Single-page HTML5 website** with no build system or backend
  - [index.html](../index.html): Main entry point with all page sections
  - [static/js/index.js](../static/js/index.js): Interactive components (video sliders, carousels)
  - [static/css/index.css](../static/css/index.css): Custom styling on top of Bulma CSS framework

### Core Features
1. **Video Comparison Slider** (`VideoComparisonSlider` class): Horizontal drag-based image reveal between simulation (left) and DwD output (right)
2. **Video Carousel**: Scene navigation with previous/next buttons and indicator dots
3. **Method Selection Dropdown**: Dynamic comparison switching between DwD, Cosmos Transfer variants, Fresco, and TCLight baselines
4. **Video Synchronization**: Master-slave sync where left video controls both videos' playback when dragging sliders

### Asset Organization
- **Video assets** live in `assets/20260123-webvideo/` organized by method:
  - `cg_process/`: Simulation (ground truth) videos
  - `dwd_process/`: DwD outputs
  - `blur_result/`, `edge_process/`, `depth_result/`, etc.: Baseline method outputs
  - All naming convention: `{LOCATION}_{ROUTE}_{FRAME}.mp4` (e.g., `Town01_Route0027_3.mp4`)

## Important Patterns & Conventions

### JavaScript
- **No frameworks** - vanilla ES6 with minimal jQuery
- **Class-based design**: Component functionality encapsulated in classes with constructor initialization
- **Event delegation**: Handle events attached to both individual elements and document level
- **Mobile-first events**: Support both mouse (`mousedown`, `mousemove`) and touch (`touchstart`, `touchmove`) events with `passive: false` for preventDefault
- **Data attributes**: Use `data-index` for identifying carousel/dropdown states
- **Event naming**: Selector-specific events (e.g., `carousel-nav-btn.carousel-prev` for previous button)

### CSS Structure
- **Bulma framework**: Primary CSS framework (minified version); custom overrides in index.css
- **Responsive grid**: Columns/containers system with `is-max-desktop` for max width
- **Video container styling**: Uses `clipPath` for the slider reveal effect (`inset(0 {100-position}% 0 0)`)
- **Layout sections**: Each major section wrapped in `<section class="section">`

### HTML Patterns
- **Video elements**: Always include `muted`, `loop`, `playsinline` attributes
- **Container nesting**: `video-comparison-container` → `video-comparison-wrapper` → individual video items
- **Accessibility**: ARIA labels on buttons (`aria-label`), semantic HTML structure

## Critical Workflows

### Adding New Scenes/Videos
1. Add corresponding video files to appropriate method folders in `assets/20260123-webvideo/{method_name}/`
2. Update HTML carousel with new `<div class="carousel-dot" data-index="N"></div>` entries
3. Add new video source in carousel containers with matching file names
4. **Update indicator count**: Carousel displays 6 scenes (indices 0-5) - adjust if adding more
5. Run video inspection: `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 {video_path}` to ensure resolution consistency

### Modifying Carousel Behavior
- Carousel navigation state tracked via `data-index` attributes
- Maximum 6 visible indicators by default - modify `.carousel-indicators` to add more dots
- Video sync logic in `VideoComparisonSlider.onVideoLoaded()` - ensure master duration calculated correctly

### Updating Method Comparisons
- Edit `<select id="method-select">` and `<select id="long-video-method-select">` with new `<option value="folder_name">Display Name</option>`
- Method folder name must match asset subdirectory name exactly
- Video paths auto-resolve from dropdown selection: `./assets/20260123-webvideo/{selected_value}/{video_name}.mp4`

## Development Setup

**No build/install required** - Static website runs directly in browser via HTTP server.

### Local Testing
```bash
# Simple Python server (ensure .mp4 files are accessible)
python3 -m http.server 8000
# Then open http://localhost:8000 in browser
```

### Common Video Format Requirements
- Codec: H.264 (MP4 container)
- Resolution: Ensure all compared videos have matching dimensions (width/height must be identical for side-by-side comparison)
- Duration: Variable, but videos in same comparison should have similar lengths for visual parity

## Debugging Tips
- **Video not playing**: Check file path in source `src` attribute matches actual asset location
- **Slider not syncing**: Verify `VideoComparisonSlider.masterDuration` is set correctly after both videos load
- **Layout broken**: Check Bulma CSS classes are applied (`is-centered`, `column`, `is-four-fifths`, etc.)
- **Touch events not working**: Ensure event listeners use `{ passive: false }` for preventDefault on mobile
- **Video indicator dots not displaying**: Verify `data-index` values match number of carousel items in DOM

## File Modification Guidelines
- Keep markup semantic and minimize class churn
- Preserve aspect ratios in video containers (use CSS not hardcoded dimensions)
- When adding features, follow existing event naming conventions for carousel navigation
- Test on both desktop and mobile viewports (sliders should work with touch)
