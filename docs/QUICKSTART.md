# Wellnix Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Python 3.11+ installed
- Virtual environment set up
- Dependencies installed

### Running the Application

#### Option 1: Using the Run Script (Recommended)
```powershell
.\run.ps1
```

#### Option 2: Manual Start
```powershell
# 1. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 2. Run the application
python app.py
```

The application will start on: **http://127.0.0.1:5000**

---

## 📂 What's New in Phase 1

### New Files Added
1. **`static/css/design-system.css`** - Core design tokens and utilities
2. **`static/css/components.css`** - Reusable UI components
3. **`static/js/utilities.js`** - JavaScript utility library
4. **`PHASE1_COMPLETION.md`** - Detailed documentation

### Updated Files
1. **`templates/home.html`** - Modernized home page
2. **`health_o_meter/templates/index.html`** - Redesigned Nutri AI index

---

## 🎨 New Features

### For Users
✅ **Modern UI** - Beautiful gradients and animations
✅ **Dark Mode** - Toggle with button in bottom-right
✅ **Smooth Animations** - Professional transitions
✅ **Better Feedback** - Loading states and notifications
✅ **Responsive** - Works on all devices

### For Developers
✅ **Design System** - Consistent styling across pages
✅ **Reusable Components** - Build faster with pre-made components
✅ **Utility Functions** - JavaScript helpers for common tasks
✅ **Documentation** - Clear code comments

---

## 🌐 Pages Available

### Live Pages
1. **Home Page** - `/` ✨ UPDATED
2. **Nutri AI Index** - `/health` ✨ UPDATED
3. **Nutri AI Profile** - `/health/profile`
4. **Nutri AI Upload** - `/health/upload`
5. **Nutri AI Results** - `/health/results`
6. **Muscle AI Index** - `/muscle`
7. **Muscle AI Live** - `/muscle/live`

---

## 🎯 Testing Checklist

### Visual Testing
- [ ] Visit home page - check gradients and animations
- [ ] Test dark mode toggle (bottom-right button)
- [ ] Scroll down - check scroll animations
- [ ] Test on mobile (responsive design)
- [ ] Check Nutri AI index page

### Functionality Testing
- [ ] Create profile in Nutri AI
- [ ] Upload nutrition label
- [ ] View results
- [ ] Upload video in Muscle AI
- [ ] Test live analysis

### Browser Testing
- [ ] Chrome/Edge (recommended)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## 🐛 Troubleshooting

### Application Won't Start
```powershell
# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies if needed
pip install -r requirements.txt
```

### CSS Not Loading
- Clear browser cache (Ctrl + F5)
- Check browser console for errors
- Verify files are in `static/css/` folder

### JavaScript Errors
- Check browser console (F12)
- Verify file is in `static/js/utilities.js`
- Make sure script tag is in HTML

### Missing Images
- Check `static/images/` folder
- Verify image paths in HTML
- Use `{{ url_for('static', filename='images/...') }}`

---

## 📱 Mobile Testing

The app is now fully responsive. Test on:
- iPhone (Safari)
- Android (Chrome)
- Tablet (iPad)

All features should work smoothly on mobile devices.

---

## 🎨 Customization

### Changing Colors
Edit `static/css/design-system.css`:
```css
:root {
    --primary-500: #2196f3;  /* Change this */
    --secondary-500: #4caf50; /* And this */
}
```

### Adding New Components
1. Add CSS to `static/css/components.css`
2. Follow existing patterns
3. Use design tokens from design-system.css

### Creating New Pages
```html
<!DOCTYPE html>
<html>
<head>
    <!-- Include design system -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/design-system.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/components.css') }}">
</head>
<body>
    <!-- Your content -->
    
    <!-- Include utilities -->
    <script src="{{ url_for('static', filename='js/utilities.js') }}"></script>
</body>
</html>
```

---

## 📊 Performance Tips

1. **Images**: Compress images before uploading
2. **Cache**: Browser will cache CSS/JS after first load
3. **Lazy Loading**: Images load only when visible
4. **Animations**: 60fps smooth animations

---

## 🔜 Coming in Phase 2

### Pages to Modernize
- Profile form (multi-step wizard)
- Upload page (better drag-drop)
- Results page (charts and graphs)
- Muscle AI pages

### New Features
- User dashboard
- Progress tracking
- Comparison feature
- Export to PDF

---

## 💡 Tips for Developers

### Using the Loader
```javascript
// Show loading
loader.show('Processing...');

// Update progress
loader.setProgress(50);

// Hide loading
loader.hide();
```

### Using Toasts
```javascript
toast.success('Saved successfully!');
toast.error('Something went wrong');
toast.warning('Please check your input');
toast.info('New feature available');
```

### Using File Upload
```javascript
const uploader = new Wellnix.FileUploader('element-id', {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png'],
    onSelect: (file) => {
        // Handle file selection
    }
});
```

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12)
2. Verify all files are in correct locations
3. Clear cache and hard reload
4. Check PHASE1_COMPLETION.md for details

---

## ✅ Success Criteria

Phase 1 is successful if:
- [x] Home page loads with new design
- [x] Nutri AI index looks modern
- [x] Dark mode toggle works
- [x] Animations are smooth
- [x] Mobile responsive works
- [x] All existing features still work

---

**Status**: Ready for Testing & Phase 2 Development

**Last Updated**: December 19, 2025

**Version**: 2.0 (Phase 1 Complete)
