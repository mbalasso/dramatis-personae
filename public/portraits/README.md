### Portraits folder

Portraits can be copied directly into this folder (`public/portraits/`) without using the upload form. The filename must follow this convention:

```
<numeric-code>-<name>.<ext>
```

Examples:
```
01-Finnik.png
42-Archmage Vyndrel.jpg
100-Avar'keth.webp
9999-The Shadow.png
```

- The **numeric code** can be any sequence of digits (used for ordering; lower numbers appear first if names are equal)
- The **name** is displayed on the DM panel card and the player screen
- Supported formats: JPEG, PNG, GIF, WebP (max 10 MB each)

On the next server start, all matching files are loaded automatically. Files uploaded via the DM panel are also saved with this naming convention, so they survive restarts.
