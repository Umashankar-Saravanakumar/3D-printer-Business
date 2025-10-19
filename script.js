// 3D Print Pro - Main JavaScript File

class PrintApp {
    constructor() {
        this.currentStep = 1;
        this.uploadedFile = null;
        this.viewer = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.wireframeMode = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgressSteps();
        this.initThreeJSViewer();
        this.createDemoModel(); // Add a demo model by default
    }

    setupEventListeners() {
        // File upload
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Logo home navigation
        document.getElementById('logo-home').addEventListener('click', () => this.goToStep(1));

        // Step navigation
        document.querySelectorAll('.step.clickable').forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNumber = parseInt(step.getAttribute('data-step'));
                if (!step.classList.contains('disabled')) {
                    this.goToStep(stepNumber);
                }
            });
        });

        // Navigation buttons
        document.getElementById('proceed-to-order').addEventListener('click', () => this.goToStep(3));
        document.getElementById('start-over').addEventListener('click', () => this.goToStep(1));

        // Enhanced viewer controls
        document.getElementById('reset-view').addEventListener('click', this.resetView.bind(this));
        document.getElementById('toggle-wireframe').addEventListener('click', this.toggleWireframe.bind(this));
        document.getElementById('fullscreen-viewer').addEventListener('click', this.toggleFullscreen.bind(this));
        document.getElementById('download-stl').addEventListener('click', this.downloadSTL.bind(this));

        // Order form
        document.getElementById('order-form').addEventListener('submit', this.handleOrderSubmit.bind(this));
        
        // Price calculation
        const priceInputs = ['material', 'infill', 'layer-height', 'quantity'];
        priceInputs.forEach(id => {
            document.getElementById(id).addEventListener('change', this.calculatePrice.bind(this));
        });
    }

    // File Upload Handlers
    handleDragOver(e) {
        e.preventDefault();
        document.getElementById('upload-area').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        document.getElementById('upload-area').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        document.getElementById('upload-area').classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file type
        const validExtensions = ['.stl', '.obj', '.ply', '.step', '.stp', '.iges', '.igs', '.3mf', '.amf'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            this.showError('Unsupported file format. Please upload a valid 3D model file.');
            return;
        }

        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            this.showError('File too large. Please upload a file smaller than 50MB.');
            return;
        }

        this.uploadedFile = {
            file: file,
            name: file.name,
            size: file.size,
            type: fileExtension
        };

        this.showUploadProgress();
        
        // Simulate file processing
        setTimeout(() => {
            this.convertToSTL(file);
        }, 1000);
    }

    showUploadProgress() {
        document.querySelector('.upload-content').style.display = 'none';
        document.getElementById('upload-progress').style.display = 'flex';
    }

    convertToSTL(file) {
        // For demo purposes, we'll create a simple STL or load the file directly
        // In a real application, you'd send this to a server for conversion
        
        if (file.name.toLowerCase().endsWith('.stl')) {
            // Already STL, load directly
            this.loadSTLFile(file);
        } else {
            // Simulate conversion for other formats
            setTimeout(() => {
                this.createDemoSTL();
            }, 2000);
        }
    }

    loadSTLFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.uploadedFile.stlData = e.target.result;
                this.goToStep(2);
            } catch (error) {
                this.showError('Failed to load STL file. Please try a different file.');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    createDemoSTL() {
        // Create a simple cube STL for demo purposes
        const stlContent = this.generateCubeSTL();
        this.uploadedFile.stlData = new TextEncoder().encode(stlContent);
        this.goToStep(2);
    }

    generateCubeSTL() {
        return `solid cube
facet normal 0.0 0.0 1.0
  outer loop
    vertex 0.0 0.0 1.0
    vertex 1.0 0.0 1.0
    vertex 1.0 1.0 1.0
  endloop
endfacet
facet normal 0.0 0.0 1.0
  outer loop
    vertex 0.0 0.0 1.0
    vertex 1.0 1.0 1.0
    vertex 0.0 1.0 1.0
  endloop
endfacet
facet normal 0.0 0.0 -1.0
  outer loop
    vertex 0.0 0.0 0.0
    vertex 1.0 1.0 0.0
    vertex 1.0 0.0 0.0
  endloop
endfacet
facet normal 0.0 0.0 -1.0
  outer loop
    vertex 0.0 0.0 0.0
    vertex 0.0 1.0 0.0
    vertex 1.0 1.0 0.0
  endloop
endfacet
facet normal 0.0 -1.0 0.0
  outer loop
    vertex 0.0 0.0 0.0
    vertex 1.0 0.0 0.0
    vertex 1.0 0.0 1.0
  endloop
endfacet
facet normal 0.0 -1.0 0.0
  outer loop
    vertex 0.0 0.0 0.0
    vertex 1.0 0.0 1.0
    vertex 0.0 0.0 1.0
  endloop
endfacet
facet normal 1.0 0.0 0.0
  outer loop
    vertex 1.0 0.0 0.0
    vertex 1.0 1.0 0.0
    vertex 1.0 1.0 1.0
  endloop
endfacet
facet normal 1.0 0.0 0.0
  outer loop
    vertex 1.0 0.0 0.0
    vertex 1.0 1.0 1.0
    vertex 1.0 0.0 1.0
  endloop
endfacet
facet normal 0.0 1.0 0.0
  outer loop
    vertex 0.0 1.0 0.0
    vertex 1.0 1.0 1.0
    vertex 1.0 1.0 0.0
  endloop
endfacet
facet normal 0.0 1.0 0.0
  outer loop
    vertex 0.0 1.0 0.0
    vertex 0.0 1.0 1.0
    vertex 1.0 1.0 1.0
  endloop
endfacet
facet normal -1.0 0.0 0.0
  outer loop
    vertex 0.0 0.0 0.0
    vertex 0.0 1.0 1.0
    vertex 0.0 1.0 0.0
  endloop
endfacet
facet normal -1.0 0.0 0.0
  outer loop
    vertex 0.0 0.0 0.0
    vertex 0.0 0.0 1.0
    vertex 0.0 1.0 1.0
  endloop
endfacet
endsolid cube`;
    }

    initThreeJSViewer() {
        const container = document.getElementById('viewer');
        const loadingDiv = document.getElementById('viewer-loading');
        const canvas = document.getElementById('threejs-canvas');
        
        // Clear previous scene if exists
        if (this.scene) {
            this.scene.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }

        // Initialize scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        
        // Setup camera with better defaults
        const aspect = container.clientWidth / container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
        this.camera.position.set(200, 200, 200);
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add lights
        this.setupLighting();
        
        // Add grid, axes, and print bed
        this.setupPrintBed();
        
        // Setup controls
        this.setupControls();
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Start animation loop
        this.animate();
        
        // Show the canvas
        loadingDiv.style.display = 'none';
        canvas.style.display = 'block';
        
        // Load model if exists
        if (this.uploadedFile) {
            this.loadCADModel();
        } else {
            this.createDemoModel();
        }
        
        // Start animation loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        
        // Show the canvas
        loadingDiv.style.display = 'none';
        canvas.style.display = 'block';
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
        mainLight.position.set(100, 100, 50);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 500;
        mainLight.shadow.camera.left = -100;
        mainLight.shadow.camera.right = 100;
        mainLight.shadow.camera.top = 100;
        mainLight.shadow.camera.bottom = -100;
        this.scene.add(mainLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-50, 50, -50);
        this.scene.add(fillLight);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0x4080ff, 0.2);
        rimLight.position.set(0, 50, -100);
        this.scene.add(rimLight);
    }
    
    setupPrintBed() {
        // Print bed (200x200mm)
        const bedGeometry = new THREE.PlaneGeometry(200, 200);
        const bedMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xe2e8f0,
            transparent: true,
            opacity: 0.8
        });
        this.printBed = new THREE.Mesh(bedGeometry, bedMaterial);
        this.printBed.rotation.x = -Math.PI / 2;
        this.printBed.receiveShadow = true;
        this.scene.add(this.printBed);
        
        // Grid helper
        const gridHelper = new THREE.GridHelper(200, 20, 0x94a3b8, 0xcbd5e1);
        gridHelper.position.y = 0.1;
        this.scene.add(gridHelper);
        
        // Coordinate axes
        const axesHelper = new THREE.AxesHelper(50);
        axesHelper.position.y = 0.2;
        this.scene.add(axesHelper);
    }
    
    initializeLoaders() {
        this.stlLoader = new THREE.STLLoader();
        this.objLoader = new THREE.OBJLoader();
        this.plyLoader = new THREE.PLYLoader();
        
        // Add loading manager for progress tracking
        this.loadingManager = new THREE.LoadingManager();
        this.loadingManager.onProgress = (url, loaded, total) => {
            const progress = (loaded / total) * 100;
            console.log(`Loading progress: ${progress.toFixed(2)}%`);
        };
    }
    
    loadCADModel() {
        if (!this.uploadedFile || !this.uploadedFile.stlData) {
            this.createDemoModel();
            return;
        }
        
        const fileExtension = this.uploadedFile.type.toLowerCase();
        const blob = new Blob([this.uploadedFile.stlData], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        
        try {
            switch (fileExtension) {
                case '.stl':
                    this.loadSTL(url);
                    break;
                case '.obj':
                    this.loadOBJ(url);
                    break;
                case '.ply':
                    this.loadPLY(url);
                    break;
                default:
                    console.log('Unsupported format, creating demo model');
                    this.createDemoModel();
            }
        } catch (error) {
            console.error('Error loading model:', error);
            this.createDemoModel();
        }
    }
    
    loadSTL(url) {
        this.stlLoader.load(url, (geometry) => {
            this.processLoadedGeometry(geometry);
            URL.revokeObjectURL(url);
        }, undefined, (error) => {
            console.error('STL loading error:', error);
            this.createDemoModel();
            URL.revokeObjectURL(url);
        });
    }
    
    loadOBJ(url) {
        this.objLoader.load(url, (object) => {
            // Extract geometry from OBJ
            let geometry = null;
            object.traverse((child) => {
                if (child.isMesh) {
                    geometry = child.geometry;
                }
            });
            if (geometry) {
                this.processLoadedGeometry(geometry);
            } else {
                this.createDemoModel();
            }
            URL.revokeObjectURL(url);
        }, undefined, (error) => {
            console.error('OBJ loading error:', error);
            this.createDemoModel();
            URL.revokeObjectURL(url);
        });
    }
    
    loadPLY(url) {
        this.plyLoader.load(url, (geometry) => {
            this.processLoadedGeometry(geometry);
            URL.revokeObjectURL(url);
        }, undefined, (error) => {
            console.error('PLY loading error:', error);
            this.createDemoModel();
            URL.revokeObjectURL(url);
        });
    }
    
    processLoadedGeometry(geometry) {
        // Clean up previous model
        if (this.model) {
            this.scene.remove(this.model);
        }
        
        // Process geometry
        geometry.computeBoundingBox();
        geometry.computeVertexNormals();
        
        // Center the model
        const box = geometry.boundingBox;
        const center = box.getCenter(new THREE.Vector3());
        geometry.translate(-center.x, -box.min.y, -center.z);
        
        // Create material
        const material = new THREE.MeshPhongMaterial({
            color: 0x3b82f6,
            shininess: 100,
            specular: 0x111111
        });
        
        // Create mesh
        this.model = new THREE.Mesh(geometry, material);
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        this.scene.add(this.model);
        
        // Update camera position
        this.fitCameraToModel();
        
        // Update model info
        this.updateModelInfo(geometry);
        
        // Show model info panel
        document.getElementById('model-info').style.display = 'block';
    }
    
    createDemoModel() {
        // Create a demo cube when no valid model is loaded
        const geometry = new THREE.BoxGeometry(20, 20, 20);
        const material = new THREE.MeshPhongMaterial({
            color: 0x3b82f6,
            shininess: 100
        });
        
        this.model = new THREE.Mesh(geometry, material);
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        this.model.position.y = 10;
        this.scene.add(this.model);
        
        this.updateModelInfo(geometry);
        document.getElementById('model-info').style.display = 'block';
    }
    
    fitCameraToModel() {
        if (!this.model) return;
        
        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Position camera at appropriate distance
        const distance = maxDim * 2;
        this.camera.position.set(distance, distance, distance);
        this.camera.lookAt(0, size.y / 2, 0);
        
        // Update controls target
        this.controls.target.set(0, size.y / 2, 0);
        this.controls.update();
    }
    
    updateModelInfo(geometry) {
        const positions = geometry.attributes.position;
        const vertexCount = positions ? positions.count : 0;
        
        // Update vertex count in stats
        document.getElementById('vertex-count').textContent = vertexCount.toLocaleString();
        
        if (this.model) {
            const box = new THREE.Box3().setFromObject(this.model);
            const size = box.getSize(new THREE.Vector3());
            
            // Update model information
            document.getElementById('model-dimensions').textContent = 
                `${size.x.toFixed(1)} × ${size.y.toFixed(1)} × ${size.z.toFixed(1)} mm`;
            
            // Calculate volume
            const volume = (size.x * size.y * size.z) / 1000; // cm³
            document.getElementById('model-volume').textContent = `${volume.toFixed(2)} cm³`;
            
            // Triangle count
            const triangleCount = vertexCount / 3;
            document.getElementById('model-triangles').textContent = Math.floor(triangleCount).toLocaleString();
            
            // Estimate print time
            const printTime = Math.max(1, Math.round(volume * 0.5));
            document.getElementById('print-time').textContent = `~${printTime}h`;
        }
    }
    
    setupPerformanceMonitoring() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        
        setInterval(() => {
            const now = performance.now();
            const fps = Math.round(this.frameCount * 1000 / (now - this.lastTime));
            document.getElementById('fps-counter').textContent = fps;
            this.frameCount = 0;
            this.lastTime = now;
        }, 1000);
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        this.frameCount++;
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        const container = document.getElementById('viewer');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }


    // Three.js Viewer Controls
    resetView() {
        if (this.model && this.camera && this.controls) {
            this.fitCameraToModel();
        }
    }

    toggleWireframe() {
        if (this.model && this.model.material) {
            this.wireframeMode = !this.wireframeMode;
            this.model.material.wireframe = this.wireframeMode;
            
            const btn = document.getElementById('toggle-wireframe');
            btn.innerHTML = this.wireframeMode 
                ? '<i class="fas fa-cube"></i> Solid' 
                : '<i class="fas fa-project-diagram"></i> Wireframe';
        }
    }

    toggleFullscreen() {
        const viewerContainer = document.querySelector('.viewer-container');
        const btn = document.getElementById('fullscreen-viewer');
        
        if (!document.fullscreenElement) {
            viewerContainer.classList.add('viewer-fullscreen');
            viewerContainer.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported, using CSS fullscreen');
            });
            btn.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
        } else {
            viewerContainer.classList.remove('viewer-fullscreen');
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            btn.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
        }
        
        // Resize renderer after fullscreen change
        setTimeout(() => {
            this.onWindowResize();
        }, 100);
    }

    downloadSTL() {
        if (this.uploadedFile && this.uploadedFile.stlData) {
            const blob = new Blob([this.uploadedFile.stlData], { 
                type: 'application/octet-stream' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.uploadedFile.name.replace(/\.[^/.]+$/, '') + '.stl';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            // Generate STL from current model if available
            if (this.model && this.model.geometry) {
                this.exportModelAsSTL();
            } else {
                this.showTemporaryMessage('No model available for download', 'error');
            }
        }
    }

    exportModelAsSTL() {
        if (!this.model || !this.model.geometry) return;

        const geometry = this.model.geometry;
        const vertices = geometry.attributes.position.array;
        
        // Generate STL content
        let stlContent = 'solid exported_model\n';
        
        for (let i = 0; i < vertices.length; i += 9) {
            // Calculate normal (simplified)
            const v1 = new THREE.Vector3(vertices[i], vertices[i+1], vertices[i+2]);
            const v2 = new THREE.Vector3(vertices[i+3], vertices[i+4], vertices[i+5]);
            const v3 = new THREE.Vector3(vertices[i+6], vertices[i+7], vertices[i+8]);
            
            const normal = new THREE.Vector3();
            const edge1 = v2.clone().sub(v1);
            const edge2 = v3.clone().sub(v1);
            normal.crossVectors(edge1, edge2).normalize();
            
            stlContent += `facet normal ${normal.x} ${normal.y} ${normal.z}\n`;
            stlContent += '  outer loop\n';
            stlContent += `    vertex ${v1.x} ${v1.y} ${v1.z}\n`;
            stlContent += `    vertex ${v2.x} ${v2.y} ${v2.z}\n`;
            stlContent += `    vertex ${v3.x} ${v3.y} ${v3.z}\n`;
            stlContent += '  endloop\n';
            stlContent += 'endfacet\n';
        }
        
        stlContent += 'endsolid exported_model';
        
        // Download the generated STL
        const blob = new Blob([stlContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exported_model.stl';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showTemporaryMessage('STL file exported successfully', 'success');
    }

    // Order Management
    calculatePrice() {
        const material = document.getElementById('material').value;
        const infill = parseInt(document.getElementById('infill').value);
        const layerHeight = parseFloat(document.getElementById('layer-height').value);
        const quantity = parseInt(document.getElementById('quantity').value);

        // Material costs per gram
        const materialCosts = {
            'PLA': 0.05,
            'ABS': 0.08,
            'PETG': 0.10,
            'TPU': 0.15
        };

        // Layer height multipliers
        const layerMultipliers = {
            0.1: 1.5,
            0.2: 1.0,
            0.3: 0.8
        };

        const basePrice = 5.00;
        const materialCost = materialCosts[material] || 0.05;
        const layerMultiplier = layerMultipliers[layerHeight] || 1.0;
        
        // Estimate based on file size (rough approximation)
        const volumeEstimate = this.uploadedFile ? this.uploadedFile.size / 1000 : 100;
        const infillMultiplier = infill / 100;
        
        const unitPrice = (basePrice + (volumeEstimate * materialCost * infillMultiplier)) * layerMultiplier;
        const totalPrice = unitPrice * quantity;

        document.getElementById('price-estimate').textContent = `$${totalPrice.toFixed(2)}`;
    }

    handleOrderSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const orderData = Object.fromEntries(formData.entries());
        
        // Generate order ID
        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        
        // Store order data
        this.orderData = {
            orderId,
            ...orderData,
            file: this.uploadedFile,
            estimatedPrice: document.getElementById('price-estimate').textContent,
            timestamp: new Date().toISOString()
        };

        // In a real application, you would send this to a server
        console.log('Order submitted:', this.orderData);
        
        // Show confirmation
        this.showOrderConfirmation();
        this.goToStep(4);
    }

    showOrderConfirmation() {
        const summaryContainer = document.getElementById('order-summary');
        
        summaryContainer.innerHTML = `
            <h3>Order Summary</h3>
            <div class="summary-row">
                <span>Order ID:</span>
                <span class="order-id">${this.orderData.orderId}</span>
            </div>
            <div class="summary-row">
                <span>File:</span>
                <span>${this.orderData.file.name}</span>
            </div>
            <div class="summary-row">
                <span>Material:</span>
                <span>${this.orderData.material}</span>
            </div>
            <div class="summary-row">
                <span>Quantity:</span>
                <span>${this.orderData.quantity}</span>
            </div>
            <div class="summary-row">
                <span>Estimated Price:</span>
                <span>${this.orderData.estimatedPrice}</span>
            </div>
        `;

        // Update file info in order form
        const fileInfoContainer = document.getElementById('file-info');
        if (fileInfoContainer && this.uploadedFile) {
            fileInfoContainer.innerHTML = `
                <h4>${this.uploadedFile.name}</h4>
                <p>Size: ${(this.uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            `;
        }
    }

    // Navigation
    goToStep(step) {
        // Validate step access
        if (!this.canAccessStep(step)) {
            this.showStepValidationMessage(step);
            return;
        }

        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const sections = ['upload-section', 'preview-section', 'order-section', 'confirmation-section'];
        document.getElementById(sections[step - 1]).classList.add('active');

        this.currentStep = step;
        this.updateProgressSteps();

        // Initialize Three.js viewer when going to step 2
        if (step === 2 && !this.renderer) {
            setTimeout(() => this.initThreeJSViewer(), 100);
        }

        // Calculate initial price when going to step 3
        if (step === 3) {
            this.calculatePrice();
            this.showOrderConfirmation();
        }

        // Reset when going back to step 1
        if (step === 1) {
            this.resetApp();
        }
    }

    canAccessStep(step) {
        switch (step) {
            case 1:
                return true; // Always can go to upload
            case 2:
                return this.uploadedFile && this.uploadedFile.stlData; // Need uploaded file
            case 3:
                return this.uploadedFile && this.uploadedFile.stlData; // Need uploaded file
            case 4:
                return this.orderData; // Need submitted order
            default:
                return false;
        }
    }

    showStepValidationMessage(step) {
        let message = '';
        switch (step) {
            case 2:
                message = 'Please upload a file first to preview it.';
                break;
            case 3:
                message = 'Please upload a file first to place an order.';
                break;
            case 4:
                message = 'Please complete your order first.';
                break;
        }
        
        if (message) {
            this.showTemporaryMessage(message, 'info');
        }
    }

    showTemporaryMessage(message, type = 'info') {
        // Remove existing messages
        document.querySelectorAll('.temp-message').forEach(el => el.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `temp-message ${type === 'error' ? 'error' : 'info-message'}`;
        messageDiv.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
        
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    updateProgressSteps() {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            
            // Remove all state classes
            step.classList.remove('active', 'disabled');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (!this.canAccessStep(stepNumber)) {
                step.classList.add('disabled');
            }
        });
    }

    resetApp() {
        this.uploadedFile = null;
        this.orderData = null;
        
        // Reset upload area
        document.querySelector('.upload-content').style.display = 'block';
        document.getElementById('upload-progress').style.display = 'none';
        document.getElementById('file-input').value = '';
        
        // Clear Three.js viewer
        if (this.renderer) {
            // Dispose of Three.js resources
            if (this.model) {
                this.scene.remove(this.model);
                if (this.model.geometry) this.model.geometry.dispose();
                if (this.model.material) this.model.material.dispose();
            }
            this.renderer.dispose();
            
            // Reset viewer container
            const container = document.getElementById('viewer');
            container.innerHTML = `
                <div class="viewer-loading" id="viewer-loading">
                    <i class="fas fa-cube"></i>
                    <p>Loading 3D model...</p>
                </div>
                <canvas id="threejs-canvas" style="display: none;"></canvas>
                <div id="viewer-stats" class="viewer-stats" style="display: none;">
                    <div class="stats-item">
                        <span>FPS: <span id="fps-counter">60</span></span>
                    </div>
                    <div class="stats-item">
                        <span>Vertices: <span id="vertex-count">0</span></span>
                    </div>
                </div>
            `;
            
            // Reset properties
            this.renderer = null;
            this.scene = null;
            this.camera = null;
            this.controls = null;
            this.model = null;
        }

        // Reset form
        document.getElementById('order-form').reset();
    }

    // Utility Methods
    showError(message) {
        // Remove existing errors
        document.querySelectorAll('.error').forEach(el => el.remove());
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        
        const uploadSection = document.getElementById('upload-section');
        uploadSection.appendChild(errorDiv);
        
        // Reset upload state
        document.querySelector('.upload-content').style.display = 'block';
        document.getElementById('upload-progress').style.display = 'none';
    }


setupPrintBed() {
    // Print bed (200x200mm)
    const bedSize = 200;
    const bedGeometry = new THREE.PlaneGeometry(bedSize, bedSize);
    const bedMaterial = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.2
    });
    
    this.printBed = new THREE.Mesh(bedGeometry, bedMaterial);
    this.printBed.rotation.x = -Math.PI / 2;
    this.printBed.receiveShadow = true;
    this.scene.add(this.printBed);
    
    // Add grid helper
    const gridSize = bedSize;
    const gridDivisions = 10;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x94a3b8, 0xcbd5e1);
    gridHelper.position.y = 0.1;
    this.scene.add(gridHelper);
    
    // Add axes helper
    const axesSize = bedSize * 0.5;
    const axesHelper = new THREE.AxesHelper(axesSize);
    axesHelper.position.y = 0.2;
    this.scene.add(axesHelper);
    
    // Add bed border
    const borderGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(bedSize, 5, bedSize));
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0x64748b, linewidth: 2 });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    border.position.y = 2.5;
    this.scene.add(border);
    }

setupControls() {
    if (this.controls) {
        this.controls.dispose();
    }
    
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 1000;
    this.controls.maxPolarAngle = Math.PI * 0.9;
    
    // Add double click to focus
    this.controls.addEventListener('dblclick', () => {
        if (this.model) {
            this.fitCameraToModel();
        }
    });
}

fitCameraToModel() {
    if (!this.model) return;
    
    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * 1.2;
    
    // Limit zoom in/out
    cameraZ = Math.max(50, Math.min(1000, cameraZ));
    
    this.camera.position.copy(center);
    this.camera.position.z += cameraZ;
    this.camera.lookAt(center);
    
    this.controls.target.copy(center);
    this.controls.update();
}

processLoadedGeometry(geometry) {
    // Clean up previous model
    if (this.model) {
        this.scene.remove(this.model);
        if (this.model.geometry) this.model.geometry.dispose();
        if (this.model.material) {
            if (Array.isArray(this.model.material)) {
                this.model.material.forEach(m => m.dispose());
            } else {
                this.model.material.dispose();
            }
        }
    }

    // Process geometry
    geometry.computeBoundingBox();
    geometry.computeVertexNormals();
    
    // Center the model on the print bed
    const box = geometry.boundingBox;
    const center = box.getCenter(new THREE.Vector3());
    geometry.translate(-center.x, -box.min.y, -center.z);
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: 0x3b82f6,
        shininess: 100,
        specular: 0x111111,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    this.model = new THREE.Mesh(geometry, material);
    this.model.castShadow = true;
    this.model.receiveShadow = true;
    this.scene.add(this.model);
    
    // Update camera to fit model
    this.fitCameraToModel();
    
    // Update model info
    this.updateModelInfo(geometry);
    
    // Show model info panel
    document.getElementById('model-info').style.display = 'block';
}

updateModelInfo(geometry) {
    if (!geometry.boundingBox) return;
    
    const box = geometry.boundingBox;
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // Update dimensions
    document.getElementById('model-dimensions').textContent = 
        `${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)}`;
    
    // Update vertex and triangle count
    const vertices = geometry.attributes.position.count;
    const triangles = geometry.index ? geometry.index.count / 3 : vertices / 3;
    document.getElementById('model-vertices').textContent = vertices.toLocaleString();
    document.getElementById('model-triangles').textContent = triangles.toLocaleString();
    
    // Calculate volume (approximate)
    let volume = 0;
    const position = geometry.attributes.position;
    const index = geometry.index ? geometry.index.array : null;
    
    if (index) {
        for (let i = 0; i < index.length; i += 3) {
            const a = index[i] * 3;
            const b = index[i + 1] * 3;
            const c = index[i + 2] * 3;
            
            const v1 = new THREE.Vector3(
                position.array[a],
                position.array[a + 1],
                position.array[a + 2]
            );
            
            const v2 = new THREE.Vector3(
                position.array[b],
                position.array[b + 1],
                position.array[b + 2]
            );
            
            const v3 = new THREE.Vector3(
                position.array[c],
                position.array[c + 1],
                position.array[c + 2]
            );
            
            volume += v1.dot(v2.cross(v3)) / 6.0;
        }
    } else {
        // Fallback for non-indexed geometry
        for (let i = 0; i < position.count; i += 3) {
            const v1 = new THREE.Vector3(
                position.array[i * 3],
                position.array[i * 3 + 1],
                position.array[i * 3 + 2]
            );
            
            const v2 = new THREE.Vector3(
                position.array[(i + 1) * 3],
                position.array[(i + 1) * 3 + 1],
                position.array[(i + 1) * 3 + 2]
            );
            
            const v3 = new THREE.Vector3(
                position.array[(i + 2) * 3],
                position.array[(i + 2) * 3 + 1],
                position.array[(i + 2) * 3 + 2]
            );
            
            volume += v1.dot(v2.cross(v3)) / 6.0;
        }
    }
    
    // Convert to cm³ and take absolute value
    const volumeCm3 = Math.abs(volume) / 1000; // Convert mm³ to cm³
    document.getElementById('model-volume').textContent = volumeCm3.toFixed(2);
    
    // Update vertex count in stats
    document.getElementById('vertex-count').textContent = vertices.toLocaleString();
}

}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PrintApp();
});


