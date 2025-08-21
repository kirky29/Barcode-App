# Barcode Generator Web App

A modern, responsive web application for generating scannable barcodes from product names.

## Features

- **Simple Interface**: Clean, intuitive design for easy barcode generation
- **Multiple Barcode Types**: Support for Code 128, EAN-13, UPC-A, and Code 39
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Download Support**: Export barcodes as PNG images
- **Firebase Ready**: Prepared for Firebase integration
- **Vercel Deployment**: Optimized for Vercel hosting

## Getting Started

### Prerequisites

- A modern web browser
- Internet connection for CDN resources

### Local Development

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start generating barcodes!

### For Development with Local Server

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. **Enter Product Name**: Type the name of your product (1-50 characters)
2. **Select Barcode Type**:
   - **Code 128**: Universal barcode (recommended)
   - **EAN-13**: European Article Number (13 digits)
   - **UPC-A**: Universal Product Code (12 digits)
   - **Code 39**: Alphanumeric barcode
3. **Generate**: Click "Generate Barcode" or press Enter
4. **Download**: Save the barcode as a PNG image

## Firebase Integration

The app is ready for Firebase integration:

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project

2. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`
   - Add your Firebase config values:

```env
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

3. **Enable Services**:
   - Enable Firestore for data storage
   - Enable Authentication if needed
   - Enable Storage for file uploads

## Deployment

### Vercel (Recommended)

1. **Connect to GitHub**:
   - Push code to GitHub repository
   - Connect repository to Vercel

2. **Automatic Deployment**:
   - Vercel will automatically detect the configuration
   - App will be deployed with proper routing

3. **Environment Variables**:
   - Add Firebase environment variables in Vercel dashboard
   - Go to Project Settings > Environment Variables

### Other Platforms

The app can be deployed to any static hosting service:

- **Netlify**: Connect GitHub repo and deploy
- **GitHub Pages**: Enable Pages in repository settings
- **Firebase Hosting**: Use `firebase deploy`

## File Structure

```
barcode-generator/
├── index.html          # Main HTML file
├── style.css           # CSS styling
├── script.js           # JavaScript functionality
├── firebase.js         # Firebase configuration
├── package.json        # Dependencies and scripts
├── vercel.json         # Vercel deployment config
└── README.md           # This file
```

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Barcode generation and interactions
- **JsBarcode**: Barcode generation library
- **Firebase**: Backend services (optional)
- **Vercel**: Deployment platform

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Features in Detail

### Barcode Types

- **Code 128**: Most versatile, supports alphanumeric characters
- **EAN-13**: Standard retail barcode format
- **UPC-A**: North American retail standard
- **Code 39**: Industrial barcode format

### Responsive Design

- Mobile-first approach
- Touch-friendly interface
- Optimized for all screen sizes
- Fast loading on mobile networks

### Accessibility

- Keyboard navigation support
- Screen reader compatible
- High contrast ratios
- Focus indicators

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the browser console for errors
2. Verify internet connection for CDN resources
3. Test with different product names and barcode types

## Roadmap

- [ ] User account system with Firebase Auth
- [ ] Save generated barcodes to Firebase
- [ ] Barcode history and favorites
- [ ] Bulk barcode generation
- [ ] QR code generation
- [ ] Custom barcode styling options
- [ ] Print templates
- [ ] API endpoints for barcode generation

---

Built with ❤️ for developers who need simple barcode generation
