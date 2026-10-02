# Warehouse Mezzanine Video Production Record

## Published assets

| Asset | Path | Specification | Purpose |
|---|---|---|---|
| MP4 video | `/public/videos/warehouse/warehouse-mezzanine-steel-structure-dubai.mp4` | H.264, 720 × 1280, 30 fps, 23.8 seconds, silent | Broad browser fallback |
| WebM video | `/public/videos/warehouse/warehouse-mezzanine-steel-structure-dubai.webm` | VP9, 720 × 1280, 30 fps, 23.8 seconds, silent | Efficient modern-browser source |
| Landscape keyframe | `/public/images/video/warehouse-mezzanine-steel-structure-landscape-keyframe.webp` | WebP, 1600 × 900 | Original opening-scene reference retained for future landscape use |
| Vertical poster | `/public/images/video/warehouse-mezzanine-steel-structure-video-poster.webp` | WebP, 720 × 1280 | Pre-playback image and `VideoObject` thumbnail |

## Source and claim boundaries

- The base footage was supplied by the website owner as an external working file. The unedited source is not stored in this repository.
- The supplied footage was stabilized, reframed, colour-balanced, shortened and combined with newly generated opening and closing imagery.
- The original audio was removed. The published sequence contains no speech or sound.
- Emitronix's owned logo is used as a restrained video overlay.
- The visible website disclosure states that the sequence is representative footage and AI-assisted visualization, not evidence of a completed Emitronix project.
- No authority logo, approval claim, client identity, project sign, registration plate or confidential document was added.

## Production treatment

1. Inspected the 39.9-second, 720 × 1280 source and selected the clearest steel-frame, metal-deck, stair and connection views.
2. Stabilized the handheld footage and normalized it to 30 fps.
3. Applied a neutral construction-photography grade compatible with the Emitronix white-and-blue visual system.
4. Generated two original photorealistic warehouse-mezzanine scenes for the opening and closing keyframes, plus an original portrait poster composed for the vertical player.
5. Animated those original stills with subtle camera movement and blended them into the edited footage.
6. Added a small Emitronix logo plate and restrained blue frame rule.
7. Exported silent MP4 and WebM variants with a separate optimized 9:16 WebP poster.

## AI image-generation prompts

The built-in image-generation capability was used in photorealistic-natural mode. The source frames were used only as subject references for the idea of a warehouse mezzanine steel structure.

### Establishing keyframe

**Intended use:** opening keyframe and retained landscape reference

> Use case: photorealistic-natural. Asset type: premium 16:9 website video opening/closing keyframe for Emitronix warehouse construction services. Input images are subject references only for the idea of a warehouse mezzanine floor steel frame with corrugated metal deck; do not reproduce the exact room, camera position, clutter, dimensions, identifiable details, or site. Create an entirely original, high-end photorealistic wide scene of a modern UAE warehouse interior under construction, focused on a professionally installed mezzanine-floor steel structure. Show a clean contemporary logistics warehouse in Dubai or the UAE, pale industrial walls, high clear space, realistic daylight entering through upper windows, an organized construction zone, a spotless floor and no clutter. Include a structurally plausible blue-grey steel mezzanine with columns, primary and secondary beams, corrugated galvanized metal decking, bracing, base plates, bolted connections, and a code-conscious steel access stair with complete guardrails. Include two generic professional engineers at ground level reviewing the work, wearing white hard hats, safety footwear and clean high-visibility PPE with restrained navy and sky-blue accents; people must not be identifiable. Use premium architectural and construction photography, realistic materials and engineering proportions, crisp corporate presentation, natural texture, not a CGI render. Compose in 16:9 landscape with a 24 mm architectural lens and an eye-level wide three-quarter view showing the mezzanine underside, upper deck edge and stairs; use strong depth, clean geometry and calm negative space. Use bright natural daylight, balanced neutral whites, cool steel tones and subtle Emitronix-compatible blue accents. Ensure proper PPE, complete edge protection and handrails, a clean site and realistic structural connections. Do not imply this is an Emitronix project. Avoid copied site details, exposed unsafe edges, missing guardrails, debris, random tools, distorted beams, impossible connections, warped stairs, distorted hands, duplicate people, readable text, logos, authority branding, project signs, confidential drawings, vehicle registrations, watermarks, exaggerated futuristic architecture, heavy HDR and oversaturation.

### Detail keyframe

**Intended use:** closing keyframe

> Use case: photorealistic-natural. Asset type: second 16:9 keyframe for a premium warehouse mezzanine construction video. Use the supplied generated image as a style and subject-family reference only; create a new complementary camera angle rather than copying the frame. Create an entirely original, high-end photorealistic close three-quarter view beneath a professionally installed warehouse mezzanine floor steel structure in a modern UAE logistics facility. Show a clean Dubai/UAE warehouse interior under construction with pale industrial wall panels, a clear organized floor and natural daylight. Include realistic blue-grey steel columns and beams, galvanized corrugated metal deck, visible bolted end-plate connections, bracing, base plates, complete stair guardrails and edge protection. Include one generic professional engineer in a white hard hat, safety shoes and clean high-visibility PPE with restrained navy and sky-blue accents, inspecting the connection from a safe ground-level position. Use premium architectural construction photography with true material texture and technically plausible proportions, natural rather than CGI. Compose in 16:9 landscape with a low but realistic 28 mm camera angle looking along the underside of the mezzanine toward the stair, strong leading lines and depth, suitable for a slow cinematic pan. Use bright controlled natural daylight, neutral whites, cool steel tones and subtle blue brand harmony. Ensure a safe working posture, proper PPE and complete protection. Do not imply this is an Emitronix project. Avoid a copied layout, unsafe exposed edges, clutter, debris, distorted connections, impossible structure, warped stairs, distorted hands, duplicate people, text, logos, authority marks, project signs, documents, vehicle registrations, watermarks, futuristic architecture and heavy HDR.

### Vertical website poster

**Intended use:** 9:16 pre-playback image and `VideoObject` thumbnail

> Use case: photorealistic-natural. Asset type: vertical 9:16 website video poster for Emitronix warehouse construction services. Use the landscape keyframe only as a reference for engineering realism, clean premium mood and cool steel palette; create a clearly original warehouse layout, structure arrangement, camera position and generic people. Show a modern, clean UAE logistics warehouse interior under construction in natural daylight with a structurally plausible steel mezzanine-floor system, complete edge protection and safe access stair. Include two non-identifiable professional engineers at ground level in proper PPE. Compose specifically for 9:16 with the stair, mezzanine deck edge, underside framing, columns, connections and both engineers inside the central safe area. Use realistic architectural construction photography and neutral white-and-blue brand harmony. Do not imply this is an Emitronix project. Avoid copied site details, unsafe work, distorted structure or people, embedded text, logos, authority marks, project signs, confidential material, registrations, watermarks, futuristic architecture, heavy HDR and oversaturation.

## Website integration

- The video appears only on `/warehouse-construction`.
- Playback uses WebM first with MP4 fallback.
- The poster reserves the video's 9:16 aspect ratio to prevent layout shift.
- The silent video sits in a labelled disclosure and uses `preload="none"`. Playback starts through the native controls; it plays inline without autoplay or looping.
- Native controls remain available, including for visitors who prefer reduced motion.
- A visible equivalent-text caption describes the silent sequence.
- The page includes a matching `VideoObject` with absolute production URLs, duration, upload date, dimensions, thumbnail, publisher and project-evidence disclosure.
