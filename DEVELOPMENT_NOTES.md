
# TGS Studios Website Development Notes

## Google Analytics Setup

**IMPORTANT**: Every new HTML page created for this website must include the following Google Analytics tag in the `<head>` section:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-T5VBQ62VZ2"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-T5VBQ62VZ2');
</script>
```

This should be placed after the meta tags and before the CSS links in the head section.

## Standard Page Structure

All pages should follow this structure:
1. DOCTYPE and HTML declaration
2. Head section with:
   - Meta charset and viewport
   - Meta description and keywords
   - Title
   - Google Analytics tag (above)
   - CSS links
3. Body with navigation, content, and scripts

## Required Scripts at Bottom

All pages should include these scripts before closing `</body>`:
- `js/main.js`
- `js/analytics.js`
