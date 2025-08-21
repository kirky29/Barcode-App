// Barcode Generator App with Firebase
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to initialize
    let auth, db;

    function initializeFirebase() {
        if (window.auth && window.db) {
            auth = window.auth;
            db = window.db;
            initializeApp();
        } else {
            setTimeout(initializeFirebase, 100);
        }
    }

    // Elements
    const productNameInput = document.getElementById('productName');
    const barcodeTypeSelect = document.getElementById('barcodeType');
    const generateBtn = document.getElementById('generateBtn');
    const resultSection = document.getElementById('resultSection');
    const productTitle = document.getElementById('productTitle');
    const barcode = document.getElementById('barcode');
    const barcodeText = document.getElementById('barcodeText');
    const downloadBtn = document.getElementById('downloadBtn');
    const saveBarcodeBtn = document.getElementById('saveBarcodeBtn');
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');

    // Auth elements
    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const userInfo = document.getElementById('userInfo');
    const userEmail = document.getElementById('userEmail');
    const authButtons = document.getElementById('authButtons');
    const authModal = document.getElementById('authModal');
    const modalTitle = document.getElementById('modalTitle');
    const authForm = document.getElementById('authForm');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authToggleText = document.getElementById('authToggleText');
    const authToggleLink = document.getElementById('authToggleLink');
    const closeModal = document.getElementById('closeModal');

    // Global variables
    let currentUser = null;
    let isSignUp = false;
    let currentBarcodeData = null;

    initializeFirebase();

    function initializeApp() {
        // Add event listeners
        generateBtn.addEventListener('click', generateBarcode);
        downloadBtn.addEventListener('click', downloadBarcode);
        printBtn.addEventListener('click', printBarcode);
        saveBarcodeBtn.addEventListener('click', saveBarcode);
        productNameInput.addEventListener('input', validateInput);
        productNameInput.addEventListener('keypress', handleEnterKey);

        // Authentication event listeners
        signInBtn.addEventListener('click', () => openAuthModal(false));
        signUpBtn.addEventListener('click', () => openAuthModal(true));
        signOutBtn.addEventListener('click', signOut);
        closeModal.addEventListener('click', () => authModal.style.display = 'none');
        authForm.addEventListener('submit', handleAuth);
        authToggleLink.addEventListener('click', toggleAuthMode);

        // Close modal when clicking outside
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.style.display = 'none';
            }
        });

        // Firebase auth state observer
        window.onAuthStateChanged = async (callback) => {
            const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
            return onAuthStateChanged(auth, callback);
        };

        window.onAuthStateChanged((user) => {
            currentUser = user;
            updateAuthUI(user);
            if (user) {
                loadBarcodeHistory();
            }
        });

        // Focus on product name input
        productNameInput.focus();
    }

    function validateInput() {
        const input = productNameInput.value.trim();
        const isValid = input.length > 0 && input.length <= 50;

        // Remove error styling if input is valid
        if (isValid) {
            productNameInput.classList.remove('error');
            const errorMsg = productNameInput.parentNode.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        }

        return isValid;
    }

    function handleEnterKey(e) {
        if (e.key === 'Enter') {
            generateBarcode();
        }
    }

    function generateBarcode() {
        const productName = productNameInput.value.trim();
        const barcodeType = barcodeTypeSelect.value;

        // Validate input
        if (!validateInput()) {
            showError('Please enter a product name (1-50 characters)');
            productNameInput.focus();
            return;
        }

        // Show loading state
        setLoadingState(true);

        try {
            // Generate barcode text based on type
            const barcodeTextValue = generateBarcodeText(productName, barcodeType);

            // Store current barcode data
            currentBarcodeData = {
                productName,
                barcodeType,
                barcodeText: barcodeTextValue,
                timestamp: new Date()
            };

            // Update UI
            productTitle.textContent = productName;
            barcodeText.textContent = barcodeTextValue;

            // Show save button if user is logged in
            saveBarcodeBtn.style.display = currentUser ? 'inline-flex' : 'none';

            // Generate barcode using JsBarcode
            JsBarcode('#barcode', barcodeTextValue, {
                format: barcodeType,
                width: 2,
                height: 100,
                displayValue: false,
                margin: 10,
                background: '#ffffff',
                lineColor: '#000000'
            });

            // Show result section
            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });

            // Hide loading state
            setLoadingState(false);

        } catch (error) {
            console.error('Barcode generation error:', error);
            showError('Failed to generate barcode. Please try a different type or product name.');
            setLoadingState(false);
        }
    }

    function generateBarcodeText(productName, type) {
        // For different barcode types, we need appropriately formatted data
        switch (type) {
            case 'EAN13':
                // EAN-13 needs exactly 12 digits, we'll create a valid EAN-13 from product name
                return generateEAN13(productName);
            case 'UPC':
                // UPC-A needs exactly 11 digits
                return generateUPC(productName);
            case 'CODE39':
                // Code 39 can handle alphanumeric data
                return productName.toUpperCase().replace(/[^A-Z0-9\-.$\/+%\s]/g, '');
            case 'CODE128':
            default:
                // Code 128 is most flexible
                return productName.replace(/[^a-zA-Z0-9\-.$\/+%\s]/g, '');
        }
    }

    function generateEAN13(productName) {
        // Create a 12-digit number from product name hash
        let hash = 0;
        for (let i = 0; i < productName.length; i++) {
            hash = ((hash << 5) - hash) + productName.charCodeAt(i);
            hash = hash & hash; // Convert to 32-bit integer
        }

        // Take absolute value and ensure it's 12 digits
        const baseNumber = Math.abs(hash).toString().padStart(12, '0').slice(0, 12);

        // Calculate check digit for EAN-13
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            const digit = parseInt(baseNumber[i]);
            sum += digit * (i % 2 === 0 ? 1 : 3);
        }
        const checkDigit = (10 - (sum % 10)) % 10;

        return baseNumber + checkDigit;
    }

    function generateUPC(productName) {
        // Create an 11-digit number from product name hash
        let hash = 0;
        for (let i = 0; i < productName.length; i++) {
            hash = ((hash << 5) - hash) + productName.charCodeAt(i);
            hash = hash & hash;
        }

        const baseNumber = Math.abs(hash).toString().padStart(11, '0').slice(0, 11);

        // Calculate check digit for UPC-A
        let sum = 0;
        for (let i = 0; i < 11; i++) {
            const digit = parseInt(baseNumber[i]);
            sum += digit * (i % 2 === 0 ? 3 : 1);
        }
        const checkDigit = (10 - (sum % 10)) % 10;

        return baseNumber + checkDigit;
    }

    function downloadBarcode() {
        try {
            // Get the SVG element
            const svg = document.getElementById('barcode');
            const svgData = new XMLSerializer().serializeToString(svg);

            // Create a canvas to convert SVG to PNG
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            // Set canvas size
            canvas.width = 400;
            canvas.height = 200;

            img.onload = function() {
                // Fill background with white
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw the image
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Create download link
                const link = document.createElement('a');
                link.download = `${productTitle.textContent.replace(/[^a-zA-Z0-9]/g, '_')}_barcode.png`;
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            // Load the SVG as an image
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            img.src = url;

        } catch (error) {
            console.error('Download error:', error);
            showError('Failed to download barcode image.');
        }
    }

    function printBarcode() {
        try {
            // Get the SVG element
            const svg = document.getElementById('barcode');
            const svgData = new XMLSerializer().serializeToString(svg);

            // Create a canvas to convert SVG to image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            // Set canvas size optimized for label printing (Brother TD-2020 uses 30mm x 10mm labels)
            // Convert to pixels at 300 DPI for high quality printing
            const labelWidthMM = 30; // Brother TD-2020 label width (3cm)
            const labelHeightMM = 10; // Brother TD-2020 label height (1cm)
            const dpi = 300;
            const mmToInches = 25.4;
            
            canvas.width = Math.round((labelWidthMM / mmToInches) * dpi);
            canvas.height = Math.round((labelHeightMM / mmToInches) * dpi);

            img.onload = function() {
                // Fill background with white
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Calculate scaling to fit barcode within label dimensions
                // For small labels (30mm x 10mm), we need to be more conservative
                const scale = Math.min(
                    (canvas.width * 0.85) / img.width,
                    (canvas.height * 0.6) / img.height
                );
                
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                
                // Center the barcode on the label
                const x = (canvas.width - scaledWidth) / 2;
                const y = (canvas.height - scaledHeight) / 2;

                // Draw the scaled barcode
                ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

                // Add product name below barcode (very small font for small labels)
                ctx.fillStyle = '#000000';
                ctx.font = `${Math.round(canvas.height * 0.12)}px Arial, sans-serif`;
                ctx.textAlign = 'center';
                
                const productName = productTitle.textContent;
                const maxWidth = canvas.width * 0.9;
                
                // Truncate product name if too long
                let displayName = productName;
                while (ctx.measureText(displayName).width > maxWidth && displayName.length > 0) {
                    displayName = displayName.slice(0, -1);
                }
                
                ctx.fillText(displayName, canvas.width / 2, canvas.height * 0.9);

                // Create print window
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Print Barcode Label</title>
                        <style>
                            body {
                                margin: 0;
                                padding: 0;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                min-height: 100vh;
                                background: white;
                            }
                            .label-container {
                                width: ${labelWidthMM}mm;
                                height: ${labelHeightMM}mm;
                                border: 1px solid #ccc;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                background: white;
                            }
                            .label-container img {
                                width: 100%;
                                height: 100%;
                                object-fit: contain;
                            }
                            @media print {
                                body { margin: 0; }
                                .label-container { border: none; }
                                @page { 
                                    size: ${labelWidthMM}mm ${labelHeightMM}mm; 
                                    margin: 0; 
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="label-container">
                            <img src="${canvas.toDataURL('image/png')}" alt="Barcode Label">
                        </div>
                        <script>
                            window.onload = function() {
                                setTimeout(function() {
                                    window.print();
                                    setTimeout(function() {
                                        window.close();
                                    }, 100);
                                }, 500);
                            };
                        </script>
                    </body>
                    </html>
                `);
                printWindow.document.close();
            };

            // Load the SVG as an image
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            img.src = url;

        } catch (error) {
            console.error('Print error:', error);
            showError('Failed to print barcode label.');
        }
    }

    function setLoadingState(loading) {
        if (loading) {
            generateBtn.classList.add('loading');
            generateBtn.innerHTML = '<span class="spinner"></span>Generating...';
            generateBtn.disabled = true;
        } else {
            generateBtn.classList.remove('loading');
            generateBtn.innerHTML = '<span class="btn-text">Generate Barcode</span><span class="btn-icon">📦</span>';
            generateBtn.disabled = false;
        }
    }

    function showError(message) {
        // Remove existing error message
        const existingError = productNameInput.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error styling to input
        productNameInput.classList.add('error');

        // Create and show error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        productNameInput.parentNode.appendChild(errorElement);

        // Auto-hide error after 5 seconds
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
                productNameInput.classList.remove('error');
            }
        }, 5000);
    }

    // Add some helpful features
    function addKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Enter to generate
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                generateBarcode();
            }

            // Escape to clear
            if (e.key === 'Escape') {
                productNameInput.value = '';
                resultSection.style.display = 'none';
                productNameInput.focus();
            }
        });
    }

    // Initialize keyboard shortcuts
    addKeyboardShortcuts();

    // Add smooth scrolling for better UX
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Authentication Functions
    function updateAuthUI(user) {
        if (user) {
            // User is signed in
            userEmail.textContent = user.email;
            userInfo.style.display = 'flex';
            authButtons.style.display = 'none';
            saveBarcodeBtn.style.display = currentBarcodeData ? 'inline-flex' : 'none';
        } else {
            // User is signed out
            userInfo.style.display = 'none';
            authButtons.style.display = 'flex';
            saveBarcodeBtn.style.display = 'none';
            historySection.style.display = 'none';
        }
    }

    function openAuthModal(signUp = false) {
        isSignUp = signUp;
        modalTitle.textContent = signUp ? 'Sign Up' : 'Sign In';
        authSubmitBtn.textContent = signUp ? 'Sign Up' : 'Sign In';
        authToggleText.innerHTML = signUp
            ? 'Already have an account? <a href="#" id="authToggleLink">Sign In</a>'
            : 'Don\'t have an account? <a href="#" id="authToggleLink">Sign Up</a>';

        // Re-attach event listener for the toggle link
        const newToggleLink = document.getElementById('authToggleLink');
        newToggleLink.addEventListener('click', toggleAuthMode);

        authForm.reset();
        authModal.style.display = 'flex';

        // Focus on email input
        setTimeout(() => {
            document.getElementById('email').focus();
        }, 100);
    }

    function toggleAuthMode(e) {
        e.preventDefault();
        openAuthModal(!isSignUp);
    }

    async function handleAuth(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        try {
            if (isSignUp) {
                await window.signUpWithEmailAndPassword(email, password);
                showSuccess('Account created successfully!');
            } else {
                await window.signInWithEmailAndPassword(email, password);
                showSuccess('Signed in successfully!');
            }

            authModal.style.display = 'none';
            authForm.reset();
        } catch (error) {
            console.error('Auth error:', error);
            showError(getAuthErrorMessage(error.code));
        }
    }

    async function signOut() {
        try {
            await window.signOutUser();
            showSuccess('Signed out successfully!');
            historyList.innerHTML = '';
        } catch (error) {
            console.error('Sign out error:', error);
            showError('Failed to sign out');
        }
    }

    function getAuthErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters';
            case 'auth/invalid-email':
                return 'Please enter a valid email address';
            default:
                return 'Authentication failed. Please try again.';
        }
    }

    // Firestore Functions
    async function saveBarcode() {
        if (!currentUser || !currentBarcodeData) {
            showError('Please sign in to save barcodes');
            return;
        }

        try {
            const barcodeData = {
                ...currentBarcodeData,
                userId: currentUser.uid,
                createdAt: new Date()
            };

            console.log('Saving barcode data:', barcodeData);
            console.log('Current user UID:', currentUser.uid);
            console.log('User authenticated:', !!currentUser);

            await window.addDocToFirestore(barcodeData);

            showSuccess('Barcode saved successfully!');
            loadBarcodeHistory();
        } catch (error) {
            console.error('Save barcode error:', error);
            showError('Failed to save barcode');
        }
    }

    async function loadBarcodeHistory() {
        if (!currentUser) return;

        try {
            // Temporarily use a simpler query while the index builds
            const querySnapshot = await window.getBarcodeHistorySimple(currentUser.uid);

            historyList.innerHTML = '';

            if (querySnapshot.empty) {
                historyList.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin: 2rem 0;">No saved barcodes yet</p>';
            } else {
                // Sort by createdAt manually since we're not using orderBy in the query
                const barcodes = [];
                querySnapshot.forEach((doc) => {
                    const barcode = doc.data();
                    barcodes.push({ id: doc.id, ...barcode });
                });
                
                // Sort by creation date (newest first)
                barcodes.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
                    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
                    return dateB - dateA;
                });
                
                // Display sorted barcodes
                barcodes.slice(0, 10).forEach((barcode) => {
                    const historyItem = createHistoryItem(barcode.id, barcode);
                    historyList.appendChild(historyItem);
                });
            }

            historySection.style.display = 'block';
        } catch (error) {
            console.error('Load history error:', error);
            showError('Failed to load barcode history');
        }
    }

    function createHistoryItem(id, barcode) {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = barcode.createdAt.toDate().toLocaleDateString();
        const time = barcode.createdAt.toDate().toLocaleTimeString();

        item.innerHTML = `
            <div class="history-item-info">
                <h4 id="productName-${id}">${barcode.productName}</h4>
                <small>Type: ${barcode.barcodeType} | ${barcode.barcodeText}</small>
                <small>Saved: ${date} at ${time}</small>
            </div>
            <div class="history-item-actions">
                <button class="edit-btn" onclick="editBarcodeName('${id}', '${barcode.productName}')">
                    Edit
                </button>
                <button class="print-btn" onclick="printBarcodeFromHistory('${barcode.barcodeText}', '${barcode.productName}', '${barcode.barcodeType}')">
                    Print
                </button>
                <button class="download-btn" onclick="downloadBarcodeFromHistory('${barcode.barcodeText}', '${barcode.productName}')">
                    Download
                </button>
                <button class="delete-btn" onclick="deleteBarcode('${id}')">
                    Delete
                </button>
            </div>
        `;

        return item;
    }

    // Global functions for onclick handlers
    window.downloadBarcodeFromHistory = function(barcodeText, productName) {
        // Set the barcode data temporarily
        currentBarcodeData = {
            productName,
            barcodeText,
            barcodeType: 'CODE128'
        };

        // Update the display
        productTitle.textContent = productName;
        barcodeText.textContent = barcodeText;

        // Generate the barcode
        JsBarcode('#barcode', barcodeText, {
            format: 'CODE128',
            width: 2,
            height: 100,
            displayValue: false,
            margin: 10,
            background: '#ffffff',
            lineColor: '#000000'
        });

        // Show the result section
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
    };

    window.printBarcodeFromHistory = function(barcodeText, productName, barcodeType) {
        try {
            // Generate the barcode temporarily for printing
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            const tempImg = new Image();

            // Set canvas size optimized for label printing (Brother TD-2020 uses 30mm x 10mm labels)
            const labelWidthMM = 30; // Brother TD-2020 label width (3cm)
            const labelHeightMM = 10; // Brother TD-2020 label height (1cm)
            const dpi = 300;
            const mmToInches = 25.4;
            
            tempCanvas.width = Math.round((labelWidthMM / mmToInches) * dpi);
            tempCanvas.height = Math.round((labelHeightMM / mmToInches) * dpi);

            tempImg.onload = function() {
                // Fill background with white
                tempCtx.fillStyle = '#ffffff';
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

                // Calculate scaling to fit barcode within label dimensions
                // For small labels (30mm x 10mm), we need to be more conservative
                const scale = Math.min(
                    (tempCanvas.width * 0.85) / tempImg.width,
                    (tempCanvas.height * 0.6) / tempImg.height
                );
                
                const scaledWidth = tempImg.width * scale;
                const scaledHeight = tempImg.height * scale;
                
                // Center the barcode on the label
                const x = (tempCanvas.width - scaledWidth) / 2;
                const y = (tempCanvas.height - scaledHeight) / 2;

                // Draw the scaled barcode
                tempCtx.drawImage(tempImg, x, y, scaledWidth, scaledHeight);

                // Add product name below barcode (very small font for small labels)
                tempCtx.fillStyle = '#000000';
                tempCtx.font = `${Math.round(tempCanvas.height * 0.12)}px Arial, sans-serif`;
                tempCtx.textAlign = 'center';
                
                const maxWidth = tempCanvas.width * 0.9;
                
                // Truncate product name if too long
                let displayName = productName;
                while (tempCtx.measureText(displayName).width > maxWidth && displayName.length > 0) {
                    displayName = displayName.slice(0, -1);
                }
                
                tempCtx.fillText(displayName, tempCanvas.width / 2, tempCanvas.height * 0.9);

                // Create print window
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Print Barcode Label</title>
                        <style>
                            body {
                                margin: 0;
                                padding: 0;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                min-height: 100vh;
                                background: white;
                            }
                            .label-container {
                                width: ${labelWidthMM}mm;
                                height: ${labelHeightMM}mm;
                                border: 1px solid #ccc;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                background: white;
                            }
                            .label-container img {
                                width: 100%;
                                height: 100%;
                                object-fit: contain;
                            }
                            @media print {
                                body { margin: 0; }
                                .label-container { border: none; }
                                @page { 
                                    size: ${labelWidthMM}mm ${labelHeightMM}mm; 
                                    margin: 0; 
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="label-container">
                            <img src="${tempCanvas.toDataURL('image/png')}" alt="Barcode Label">
                        </div>
                        <script>
                            window.onload = function() {
                                setTimeout(function() {
                                    window.print();
                                    setTimeout(function() {
                                        window.close();
                                    }, 100);
                                }, 500);
                            };
                        </script>
                    </body>
                    </html>
                `);
                printWindow.document.close();
            };

            // Create temporary SVG for the barcode
            const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            tempSvg.setAttribute('width', '400');
            tempSvg.setAttribute('height', '200');
            tempSvg.style.display = 'none';
            document.body.appendChild(tempSvg);

            // Generate barcode in temporary SVG
            JsBarcode(tempSvg, barcodeText, {
                format: barcodeType || 'CODE128',
                width: 2,
                height: 100,
                displayValue: false,
                margin: 10,
                background: '#ffffff',
                lineColor: '#000000'
            });

            // Convert SVG to image
            const svgData = new XMLSerializer().serializeToString(tempSvg);
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            tempImg.src = url;

            // Clean up temporary SVG
            setTimeout(() => {
                document.body.removeChild(tempSvg);
                URL.revokeObjectURL(url);
            }, 1000);

        } catch (error) {
            console.error('Print from history error:', error);
            showError('Failed to print barcode label.');
        }
    };

    window.deleteBarcode = async function(id) {
        if (!confirm('Are you sure you want to delete this barcode?')) return;

        try {
            await window.deleteBarcodeFromFirestore(id);
            showSuccess('Barcode deleted successfully!');
            loadBarcodeHistory();
        } catch (error) {
            console.error('Delete barcode error:', error);
            showError('Failed to delete barcode');
        }
    };

    window.editBarcodeName = function(id, currentName) {
        // Find the product name element and make it editable
        const productNameElement = document.getElementById(`productName-${id}`);
        const currentText = productNameElement.textContent;
        
        // Create input field
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        input.style.cssText = `
            font-size: inherit;
            font-weight: inherit;
            color: inherit;
            background: var(--white);
            border: 2px solid var(--primary-color);
            border-radius: 4px;
            padding: 0.25rem 0.5rem;
            width: 100%;
            max-width: 200px;
            outline: none;
        `;
        
        // Replace text with input
        productNameElement.textContent = '';
        productNameElement.appendChild(input);
        
        // Add editing indicator
        productNameElement.style.position = 'relative';
        productNameElement.style.animation = 'pulse 0.6s ease-in-out';
        
        input.focus();
        input.select();
        
        // Handle save on Enter or blur
        const saveEdit = () => {
            const newName = input.value.trim();
            if (newName && newName !== currentText) {
                // Show loading state
                productNameElement.textContent = newName;
                productNameElement.style.opacity = '0.7';
                productNameElement.style.fontStyle = 'italic';
                
                updateBarcodeName(id, newName);
            } else {
                // Restore original text if no change or empty
                productNameElement.textContent = currentText;
                productNameElement.style.opacity = '1';
                productNameElement.style.fontStyle = 'normal';
            }
        };
        
        const cancelEdit = () => {
            productNameElement.textContent = currentText;
        };
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
        
        input.addEventListener('blur', saveEdit);
    };

    async function updateBarcodeName(id, newName) {
        try {
            await window.updateBarcodeInFirestore(id, { productName: newName });
            showSuccess('Product name updated successfully!');
            
            // Update the display and restore normal styling
            const productNameElement = document.getElementById(`productName-${id}`);
            if (productNameElement) {
                productNameElement.textContent = newName;
                productNameElement.style.opacity = '1';
                productNameElement.style.fontStyle = 'normal';
                productNameElement.style.animation = '';
            }
        } catch (error) {
            console.error('Update barcode error:', error);
            showError('Failed to update product name');
            
            // Restore original styling on error
            const productNameElement = document.getElementById(`productName-${id}`);
            if (productNameElement) {
                productNameElement.style.opacity = '1';
                productNameElement.style.fontStyle = 'normal';
                productNameElement.style.animation = '';
            }
        }
    }

    // Success message function
    function showSuccess(message) {
        // Remove existing messages
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create success message
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = message;
        successElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;

        document.body.appendChild(successElement);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (successElement.parentNode) {
                successElement.remove();
            }
        }, 3000);
    }
});
