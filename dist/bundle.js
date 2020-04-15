/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/three/build/three.module.js":
/*!**************************************************!*\
  !*** ./node_modules/three/build/three.module.js ***!
  \**************************************************/
/*! exports provided: ACESFilmicToneMapping, AddEquation, AddOperation, AdditiveBlending, AlphaFormat, AlwaysDepth, AlwaysStencilFunc, AmbientLight, AmbientLightProbe, AnimationClip, AnimationLoader, AnimationMixer, AnimationObjectGroup, AnimationUtils, ArcCurve, ArrayCamera, ArrowHelper, Audio, AudioAnalyser, AudioContext, AudioListener, AudioLoader, AxesHelper, AxisHelper, BackSide, BasicDepthPacking, BasicShadowMap, BinaryTextureLoader, Bone, BooleanKeyframeTrack, BoundingBoxHelper, Box2, Box3, Box3Helper, BoxBufferGeometry, BoxGeometry, BoxHelper, BufferAttribute, BufferGeometry, BufferGeometryLoader, ByteType, Cache, Camera, CameraHelper, CanvasRenderer, CanvasTexture, CatmullRomCurve3, CineonToneMapping, CircleBufferGeometry, CircleGeometry, ClampToEdgeWrapping, Clock, ClosedSplineCurve3, Color, ColorKeyframeTrack, CompressedTexture, CompressedTextureLoader, ConeBufferGeometry, ConeGeometry, CubeCamera, CubeGeometry, CubeReflectionMapping, CubeRefractionMapping, CubeTexture, CubeTextureLoader, CubeUVReflectionMapping, CubeUVRefractionMapping, CubicBezierCurve, CubicBezierCurve3, CubicInterpolant, CullFaceBack, CullFaceFront, CullFaceFrontBack, CullFaceNone, Curve, CurvePath, CustomBlending, CylinderBufferGeometry, CylinderGeometry, Cylindrical, DataTexture, DataTexture2DArray, DataTexture3D, DataTextureLoader, DecrementStencilOp, DecrementWrapStencilOp, DefaultLoadingManager, DepthFormat, DepthStencilFormat, DepthTexture, DirectionalLight, DirectionalLightHelper, DirectionalLightShadow, DiscreteInterpolant, DodecahedronBufferGeometry, DodecahedronGeometry, DoubleSide, DstAlphaFactor, DstColorFactor, DynamicBufferAttribute, DynamicCopyUsage, DynamicDrawUsage, DynamicReadUsage, EdgesGeometry, EdgesHelper, EllipseCurve, EqualDepth, EqualStencilFunc, EquirectangularReflectionMapping, EquirectangularRefractionMapping, Euler, EventDispatcher, ExtrudeBufferGeometry, ExtrudeGeometry, Face3, Face4, FaceColors, FileLoader, FlatShading, Float32Attribute, Float32BufferAttribute, Float64Attribute, Float64BufferAttribute, FloatType, Fog, FogExp2, Font, FontLoader, FrontFaceDirectionCCW, FrontFaceDirectionCW, FrontSide, Frustum, GammaEncoding, Geometry, GeometryUtils, GreaterDepth, GreaterEqualDepth, GreaterEqualStencilFunc, GreaterStencilFunc, GridHelper, Group, HalfFloatType, HemisphereLight, HemisphereLightHelper, HemisphereLightProbe, IcosahedronBufferGeometry, IcosahedronGeometry, ImageBitmapLoader, ImageLoader, ImageUtils, ImmediateRenderObject, IncrementStencilOp, IncrementWrapStencilOp, InstancedBufferAttribute, InstancedBufferGeometry, InstancedInterleavedBuffer, InstancedMesh, Int16Attribute, Int16BufferAttribute, Int32Attribute, Int32BufferAttribute, Int8Attribute, Int8BufferAttribute, IntType, InterleavedBuffer, InterleavedBufferAttribute, Interpolant, InterpolateDiscrete, InterpolateLinear, InterpolateSmooth, InvertStencilOp, JSONLoader, KeepStencilOp, KeyframeTrack, LOD, LatheBufferGeometry, LatheGeometry, Layers, LensFlare, LessDepth, LessEqualDepth, LessEqualStencilFunc, LessStencilFunc, Light, LightProbe, LightShadow, Line, Line3, LineBasicMaterial, LineCurve, LineCurve3, LineDashedMaterial, LineLoop, LinePieces, LineSegments, LineStrip, LinearEncoding, LinearFilter, LinearInterpolant, LinearMipMapLinearFilter, LinearMipMapNearestFilter, LinearMipmapLinearFilter, LinearMipmapNearestFilter, LinearToneMapping, Loader, LoaderUtils, LoadingManager, LogLuvEncoding, LoopOnce, LoopPingPong, LoopRepeat, LuminanceAlphaFormat, LuminanceFormat, MOUSE, Material, MaterialLoader, Math, MathUtils, Matrix3, Matrix4, MaxEquation, Mesh, MeshBasicMaterial, MeshDepthMaterial, MeshDistanceMaterial, MeshFaceMaterial, MeshLambertMaterial, MeshMatcapMaterial, MeshNormalMaterial, MeshPhongMaterial, MeshPhysicalMaterial, MeshStandardMaterial, MeshToonMaterial, MinEquation, MirroredRepeatWrapping, MixOperation, MultiMaterial, MultiplyBlending, MultiplyOperation, NearestFilter, NearestMipMapLinearFilter, NearestMipMapNearestFilter, NearestMipmapLinearFilter, NearestMipmapNearestFilter, NeverDepth, NeverStencilFunc, NoBlending, NoColors, NoToneMapping, NormalBlending, NotEqualDepth, NotEqualStencilFunc, NumberKeyframeTrack, Object3D, ObjectLoader, ObjectSpaceNormalMap, OctahedronBufferGeometry, OctahedronGeometry, OneFactor, OneMinusDstAlphaFactor, OneMinusDstColorFactor, OneMinusSrcAlphaFactor, OneMinusSrcColorFactor, OrthographicCamera, PCFShadowMap, PCFSoftShadowMap, PMREMGenerator, ParametricBufferGeometry, ParametricGeometry, Particle, ParticleBasicMaterial, ParticleSystem, ParticleSystemMaterial, Path, PerspectiveCamera, Plane, PlaneBufferGeometry, PlaneGeometry, PlaneHelper, PointCloud, PointCloudMaterial, PointLight, PointLightHelper, Points, PointsMaterial, PolarGridHelper, PolyhedronBufferGeometry, PolyhedronGeometry, PositionalAudio, PropertyBinding, PropertyMixer, QuadraticBezierCurve, QuadraticBezierCurve3, Quaternion, QuaternionKeyframeTrack, QuaternionLinearInterpolant, REVISION, RGBADepthPacking, RGBAFormat, RGBAIntegerFormat, RGBA_ASTC_10x10_Format, RGBA_ASTC_10x5_Format, RGBA_ASTC_10x6_Format, RGBA_ASTC_10x8_Format, RGBA_ASTC_12x10_Format, RGBA_ASTC_12x12_Format, RGBA_ASTC_4x4_Format, RGBA_ASTC_5x4_Format, RGBA_ASTC_5x5_Format, RGBA_ASTC_6x5_Format, RGBA_ASTC_6x6_Format, RGBA_ASTC_8x5_Format, RGBA_ASTC_8x6_Format, RGBA_ASTC_8x8_Format, RGBA_BPTC_Format, RGBA_ETC2_EAC_Format, RGBA_PVRTC_2BPPV1_Format, RGBA_PVRTC_4BPPV1_Format, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, RGBDEncoding, RGBEEncoding, RGBEFormat, RGBFormat, RGBIntegerFormat, RGBM16Encoding, RGBM7Encoding, RGB_ETC1_Format, RGB_ETC2_Format, RGB_PVRTC_2BPPV1_Format, RGB_PVRTC_4BPPV1_Format, RGB_S3TC_DXT1_Format, RGFormat, RGIntegerFormat, RawShaderMaterial, Ray, Raycaster, RectAreaLight, RedFormat, RedIntegerFormat, ReinhardToneMapping, RepeatWrapping, ReplaceStencilOp, ReverseSubtractEquation, RingBufferGeometry, RingGeometry, SRGB8_ALPHA8_ASTC_10x10_Format, SRGB8_ALPHA8_ASTC_10x5_Format, SRGB8_ALPHA8_ASTC_10x6_Format, SRGB8_ALPHA8_ASTC_10x8_Format, SRGB8_ALPHA8_ASTC_12x10_Format, SRGB8_ALPHA8_ASTC_12x12_Format, SRGB8_ALPHA8_ASTC_4x4_Format, SRGB8_ALPHA8_ASTC_5x4_Format, SRGB8_ALPHA8_ASTC_5x5_Format, SRGB8_ALPHA8_ASTC_6x5_Format, SRGB8_ALPHA8_ASTC_6x6_Format, SRGB8_ALPHA8_ASTC_8x5_Format, SRGB8_ALPHA8_ASTC_8x6_Format, SRGB8_ALPHA8_ASTC_8x8_Format, Scene, SceneUtils, ShaderChunk, ShaderLib, ShaderMaterial, ShadowMaterial, Shape, ShapeBufferGeometry, ShapeGeometry, ShapePath, ShapeUtils, ShortType, Skeleton, SkeletonHelper, SkinnedMesh, SmoothShading, Sphere, SphereBufferGeometry, SphereGeometry, Spherical, SphericalHarmonics3, SphericalReflectionMapping, Spline, SplineCurve, SplineCurve3, SpotLight, SpotLightHelper, SpotLightShadow, Sprite, SpriteMaterial, SrcAlphaFactor, SrcAlphaSaturateFactor, SrcColorFactor, StaticCopyUsage, StaticDrawUsage, StaticReadUsage, StereoCamera, StreamCopyUsage, StreamDrawUsage, StreamReadUsage, StringKeyframeTrack, SubtractEquation, SubtractiveBlending, TOUCH, TangentSpaceNormalMap, TetrahedronBufferGeometry, TetrahedronGeometry, TextBufferGeometry, TextGeometry, Texture, TextureLoader, TorusBufferGeometry, TorusGeometry, TorusKnotBufferGeometry, TorusKnotGeometry, Triangle, TriangleFanDrawMode, TriangleStripDrawMode, TrianglesDrawMode, TubeBufferGeometry, TubeGeometry, UVMapping, Uint16Attribute, Uint16BufferAttribute, Uint32Attribute, Uint32BufferAttribute, Uint8Attribute, Uint8BufferAttribute, Uint8ClampedAttribute, Uint8ClampedBufferAttribute, Uncharted2ToneMapping, Uniform, UniformsLib, UniformsUtils, UnsignedByteType, UnsignedInt248Type, UnsignedIntType, UnsignedShort4444Type, UnsignedShort5551Type, UnsignedShort565Type, UnsignedShortType, VSMShadowMap, Vector2, Vector3, Vector4, VectorKeyframeTrack, Vertex, VertexColors, VideoTexture, WebGLCubeRenderTarget, WebGLMultisampleRenderTarget, WebGLRenderTarget, WebGLRenderTargetCube, WebGLRenderer, WebGLUtils, WireframeGeometry, WireframeHelper, WrapAroundEnding, XHRLoader, ZeroCurvatureEnding, ZeroFactor, ZeroSlopeEnding, ZeroStencilOp, sRGBEncoding */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

/***/ }),

/***/ "./src/game.js":
/*!*********************!*\
  !*** ./src/game.js ***!
  \*********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _graphics_scene__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./graphics/scene */ \"./src/graphics/scene.js\");\n/* harmony import */ var _graphics_renderer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./graphics/renderer */ \"./src/graphics/renderer.js\");\n/* harmony import */ var _graphics_camera__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./graphics/camera */ \"./src/graphics/camera.js\");\n/* harmony import */ var _graphics_lighting__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./graphics/lighting */ \"./src/graphics/lighting.js\");\n/* harmony import */ var _input_inputHandler__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./input/inputHandler */ \"./src/input/inputHandler.js\");\n/* harmony import */ var _objects_vehicles_airplane__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./objects/vehicles/airplane */ \"./src/objects/vehicles/airplane.js\");\n/* harmony import */ var _objects_landscape_sea__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./objects/landscape/sea */ \"./src/objects/landscape/sea.js\");\n/* harmony import */ var _objects_landscape_sky__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./objects/landscape/sky */ \"./src/objects/landscape/sky.js\");\n/* harmony import */ var _objects_weapons_basicWeapon__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./objects/weapons/basicWeapon */ \"./src/objects/weapons/basicWeapon.js\");\n/* harmony import */ var _objects_landscape_meteor__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./objects/landscape/meteor */ \"./src/objects/landscape/meteor.js\");\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nconst Game = {};\n\nconst bullits = [];\n\nlet scene,\n    renderer,\n    camera,\n    width,\n    height;\n\nlet clock = new three__WEBPACK_IMPORTED_MODULE_0__[\"Clock\"](),\n    deltaTime,\n    speed = 0,\n    distance = 0,\n    baseSpeed = .35,\n    targetBaseSpeed = .35,\n    ratioSpeedDistance = 50,\n    incrementSpeedByTime = 2,\n    incrementSpeedByLevel = .5,\n    distanceForSpeedUpdate = 100,\n    speedLastUpdate = 0;\n    \nGame.setup = () => {\n    width = window.innerWidth;\n    height = window.innerHeight;\n\n    scene = _graphics_scene__WEBPACK_IMPORTED_MODULE_1__[\"default\"].create(width, height);\n    camera = _graphics_camera__WEBPACK_IMPORTED_MODULE_3__[\"default\"].create(width, height);\n    renderer = _graphics_renderer__WEBPACK_IMPORTED_MODULE_2__[\"default\"].create(width, height);\n    _graphics_lighting__WEBPACK_IMPORTED_MODULE_4__[\"default\"].create(scene);\n\n    // cameraControls = new OrbitControls(camera, renderer.domElement);\n    // scene.add(cameraControls);\n}\n\nGame.createScene = () => {\n    scene.add(_objects_vehicles_airplane__WEBPACK_IMPORTED_MODULE_6__[\"default\"].create());\n    scene.add(_objects_landscape_sea__WEBPACK_IMPORTED_MODULE_7__[\"default\"].create());\n    scene.add(_objects_landscape_sky__WEBPACK_IMPORTED_MODULE_8__[\"default\"].create());\n}\n\nGame.loop = () => {\n    requestAnimationFrame(Game.loop);\n    // cameraControls.update(deltaTime);\n\n    updateVariables();\n    updateGame();\n   \n    renderer.render(scene, camera);\n}\n\nGame.resize = () => {\n    const width = window.innerWidth;\n    const height = window.innerHeight;\n\n    renderer.setSize(width, height);\n    _graphics_camera__WEBPACK_IMPORTED_MODULE_3__[\"default\"].resize(width, height);\n}\n\nGame.addEventListeners = () => {\n    document.body.onkeyup = event => event.keyCode === 32 ? _input_inputHandler__WEBPACK_IMPORTED_MODULE_5__[\"default\"].handleSpaceBar() : null;\n    document.addEventListener('mousemove', _input_inputHandler__WEBPACK_IMPORTED_MODULE_5__[\"default\"].handleMouseMove, false);\n    document.addEventListener('touchmove', _input_inputHandler__WEBPACK_IMPORTED_MODULE_5__[\"default\"].handleTouchMove, false);\n    document.addEventListener('mouseup', _input_inputHandler__WEBPACK_IMPORTED_MODULE_5__[\"default\"].handleMouseUp, false);\n    document.addEventListener('touchend', _input_inputHandler__WEBPACK_IMPORTED_MODULE_5__[\"default\"].handleTouchEnd, false);\n    window.addEventListener(\"resize\", Game.resize, false);\n}\n\nGame.fireWeapon = () => {\n    const bullit = _objects_weapons_basicWeapon__WEBPACK_IMPORTED_MODULE_9__[\"default\"].create();\n    bullits.push(bullit); \n};\n\nGame.getScene = () => scene;\n\nGame.getDistance = () => distance;\n\nGame.getSpeed = () => speed;\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Game);\n\nconst updateVariables = () => {\n    if (Math.floor(distance) % distanceForSpeedUpdate == 0 && Math.floor(distance) > speedLastUpdate){\n        speedLastUpdate = Math.floor(distance);\n        targetBaseSpeed += incrementSpeedByTime * deltaTime;\n    }\n\n    deltaTime   = clock.getDelta();\n    distance    += speed * deltaTime * ratioSpeedDistance;\n    baseSpeed   += (targetBaseSpeed - baseSpeed) * deltaTime * 0.02;\n    speed       = baseSpeed * _objects_vehicles_airplane__WEBPACK_IMPORTED_MODULE_6__[\"default\"].getSpeed();\n\n    // console.log(speed);\n}\n\nconst updateGame = () => {\n    _graphics_camera__WEBPACK_IMPORTED_MODULE_3__[\"default\"].update(deltaTime);\n    _graphics_lighting__WEBPACK_IMPORTED_MODULE_4__[\"default\"].update(deltaTime);\n    _objects_landscape_sky__WEBPACK_IMPORTED_MODULE_8__[\"default\"].update(speed, deltaTime);\n    _objects_landscape_sea__WEBPACK_IMPORTED_MODULE_7__[\"default\"].update(speed, deltaTime);\n    _objects_vehicles_airplane__WEBPACK_IMPORTED_MODULE_6__[\"default\"].update(deltaTime, camera);\n    \n    while (bullits && bullits.length) {\n        const bullit = bullits.shift();\n        scene.add(bullit);\n        _objects_weapons_basicWeapon__WEBPACK_IMPORTED_MODULE_9__[\"default\"].add(bullit);\n    } \n    \n    _objects_weapons_basicWeapon__WEBPACK_IMPORTED_MODULE_9__[\"default\"].fire(deltaTime);\n    _objects_landscape_meteor__WEBPACK_IMPORTED_MODULE_10__[\"default\"].spawn();\n    _objects_landscape_meteor__WEBPACK_IMPORTED_MODULE_10__[\"default\"].rotate(speed, deltaTime);\n}\n\n//# sourceURL=webpack:///./src/game.js?");

/***/ }),

/***/ "./src/graphics/camera.js":
/*!********************************!*\
  !*** ./src/graphics/camera.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/utils */ \"./src/utils/utils.js\");\n/* harmony import */ var _objects_vehicles_airplane__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/vehicles/airplane */ \"./src/objects/vehicles/airplane.js\");\n/* harmony import */ var _input_inputHandler__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../input/inputHandler */ \"./src/input/inputHandler.js\");\n\n\n\n \n\nconst Camera = {};\n\nlet camera = null;\n\n/**\n * @param {Number} width \n * @param {Number} height \n */\nCamera.create = (width, height) => {\n    const aspectRatio = width / height;\n    const FOV = 75;\n    const nearPlane = 1;\n    const farPlane = 10000;\n\n    camera = new three__WEBPACK_IMPORTED_MODULE_0__[\"PerspectiveCamera\"](FOV, aspectRatio, nearPlane, farPlane);\n    camera.position.x = 0;\n    camera.position.z = 200;\n    camera.position.y = _objects_vehicles_airplane__WEBPACK_IMPORTED_MODULE_2__[\"default\"].getDefaultHeight();\n\n    return camera;\n}\n\nCamera.update = deltaTime => {\n    camera.fov = _utils_utils__WEBPACK_IMPORTED_MODULE_1__[\"default\"].normalize(_input_inputHandler__WEBPACK_IMPORTED_MODULE_3__[\"default\"].mousePos.x, -1, 1, 40, 90);\n    camera.updateProjectionMatrix ();\n    camera.position.y += (_objects_vehicles_airplane__WEBPACK_IMPORTED_MODULE_2__[\"default\"].getPosition().y - camera.position.y) * deltaTime * 0.002;\n}\n\nCamera.resize = (width, height) => {\n    camera.aspect = width / height;\n    camera.updateProjectionMatrix();\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Camera);\n\n//# sourceURL=webpack:///./src/graphics/camera.js?");

/***/ }),

/***/ "./src/graphics/lighting.js":
/*!**********************************!*\
  !*** ./src/graphics/lighting.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/colors */ \"./src/utils/colors.js\");\n\n\n\n\nconst Lighting = {};\n\nlet hemisphereLight,\n    ambientLight,\n    directionalLight;\n\n/**\n * \n * @param {THREE.Scene} scene \n */\nLighting.create = scene => {\n    hemisphereLight = new three__WEBPACK_IMPORTED_MODULE_0__[\"HemisphereLight\"](0xaaaaaa, 0x000000, .5);\n    // ambientLight = new THREE.AmbientLight(0xdc8874, .5);\n    ambientLight = new three__WEBPACK_IMPORTED_MODULE_0__[\"AmbientLight\"](_utils_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].offWhite, .5);\n    directionalLight = new three__WEBPACK_IMPORTED_MODULE_0__[\"DirectionalLight\"](0xffffff, .4);\n    directionalLight.position.set(150, 500, 350);\n    directionalLight.castShadow = true;\n    directionalLight.shadow.camera.left = -400;\n    directionalLight.shadow.camera.right = 400;\n    directionalLight.shadow.camera.top = 400;\n    directionalLight.shadow.camera.bottom = -400;\n    directionalLight.shadow.camera.near = 1;\n    directionalLight.shadow.camera.far = 1000;\n    directionalLight.shadow.mapSize.width = 4096;\n    directionalLight.shadow.mapSize.height = 4096;\n\n    // const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);\n    // scene.add(cameraHelper);\n\n    scene.add(hemisphereLight);\n    scene.add(ambientLight);\n    scene.add(directionalLight);\n}\n\nLighting.update= deltaTime => {\n    ambientLight.intensity += (.5 - ambientLight.intensity) * deltaTime * 0.005;\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Lighting);\n\n//# sourceURL=webpack:///./src/graphics/lighting.js?");

/***/ }),

/***/ "./src/graphics/renderer.js":
/*!**********************************!*\
  !*** ./src/graphics/renderer.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\n\nconst Renderer = {};\n\nRenderer.create = (width, height) => {\n    const renderer = new three__WEBPACK_IMPORTED_MODULE_0__[\"WebGLRenderer\"]({ alpha: true, antialias: true });\n    renderer.setSize(width, height);\n    renderer.shadowMap.enabled = true;\n\n    document.querySelector(\"#world\").appendChild(renderer.domElement);\n\n    return renderer;\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Renderer);\n\n//# sourceURL=webpack:///./src/graphics/renderer.js?");

/***/ }),

/***/ "./src/graphics/scene.js":
/*!*******************************!*\
  !*** ./src/graphics/scene.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/colors */ \"./src/utils/colors.js\");\n\n\n\nconst Scene = {};\n\nScene.create = () => {\n    const scene = new three__WEBPACK_IMPORTED_MODULE_0__[\"Scene\"]();\n    scene.fog = new three__WEBPACK_IMPORTED_MODULE_0__[\"Fog\"](_utils_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].orange, 100, 950);\n\n    return scene\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Scene);\n\n//# sourceURL=webpack:///./src/graphics/scene.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game */ \"./src/game.js\");\n\n\nconst init = () => {\n    _game__WEBPACK_IMPORTED_MODULE_0__[\"default\"].setup();\n    _game__WEBPACK_IMPORTED_MODULE_0__[\"default\"].createScene();\n    _game__WEBPACK_IMPORTED_MODULE_0__[\"default\"].addEventListeners();\n    _game__WEBPACK_IMPORTED_MODULE_0__[\"default\"].loop();\n}\n\nwindow.addEventListener(\"load\", init, false);\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),

/***/ "./src/input/inputHandler.js":
/*!***********************************!*\
  !*** ./src/input/inputHandler.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../game */ \"./src/game.js\");\n\n\nconst InputHandler = {};\n\nInputHandler.mousePos = { x: 0, y:0 };\n\nInputHandler.handleMouseMove = event => {\n    const x = -1 + (event.clientX / window.innerWidth) * 2;\n    const y = 1 - (event.clientY / window.innerHeight) * 2;\n\n    InputHandler.mousePos = { x, y };\n}\n  \nInputHandler.handleTouchMove = event => {\n    event.preventDefault();\n\n    const x = -1 + (event.touches[0].pageX / window.innerWidth) * 2;\n    const y = 1 - (event.touches[0].pageY / window.innerHeight) * 2;\n    \n    InputHandler.mousePos = { x, y };\n}\n  \nInputHandler.handleMouseUp = () => {\n    // if (game.status == \"waitingReplay\"){\n    //     resetGame();\n    //     hideReplay();\n    // }\n}\n  \nInputHandler.handleTouchEnd = () => {\n    // if (game.status == \"waitingReplay\"){\n    //     resetGame();\n    //     hideReplay();\n    // }\n}\n\nInputHandler.handleSpaceBar = () => _game__WEBPACK_IMPORTED_MODULE_0__[\"default\"].fireWeapon();\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (InputHandler);\n\n\n//# sourceURL=webpack:///./src/input/inputHandler.js?");

/***/ }),

/***/ "./src/objects/landscape/cloud.js":
/*!****************************************!*\
  !*** ./src/objects/landscape/cloud.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/colors */ \"./src/utils/colors.js\");\n\n\n\nconst Cloud = {};\n\nCloud.create = () => {\n    const cloud = new three__WEBPACK_IMPORTED_MODULE_0__[\"Object3D\"]();\n    cloud.name = \"cloud\";\n\n    const geom = new three__WEBPACK_IMPORTED_MODULE_0__[\"CubeGeometry\"](20,20,20);\n    const mat = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color: _utils_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].white, flatShading: true });\n\n    const numberOfBlocks = 3 + Math.floor(Math.random() * 3);\n    for (let i = 0; i < numberOfBlocks; i++) {\n        const scale = .1 + Math.random() * .9;\n        const mesh = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](geom.clone(), mat);\n        mesh.position.x = i * 15;\n        mesh.position.y = Math.random() * 10;\n        mesh.position.z = Math.random() * 10;\n        mesh.rotation.z = Math.random() * Math.PI * 2;\n        mesh.rotation.y = Math.random() * Math.PI * 2;\n        mesh.scale.set(scale, scale, scale);\n        mesh.castShadow = true;\n        mesh.receiveShadow = true;\n\n        cloud.add(mesh);\n    }\n\n    return cloud;\n}\n\nCloud.rotate = cloud => {\n    cloud.children.forEach((mesh, index) => {\n        mesh.rotation.z += Math.random() * .005 * (index + 1);\n        mesh.rotation.y += Math.random() * .002 * (index + 1);\n    });\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Cloud);\n\n//# sourceURL=webpack:///./src/objects/landscape/cloud.js?");

/***/ }),

/***/ "./src/objects/landscape/meteor.js":
/*!*****************************************!*\
  !*** ./src/objects/landscape/meteor.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/colors */ \"./src/utils/colors.js\");\n/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../game */ \"./src/game.js\");\n/* harmony import */ var _vehicles_airplane__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../vehicles/airplane */ \"./src/objects/vehicles/airplane.js\");\n\n\n\n\n\nconst Meteor = {};\nconst meteors = new Set();\nlet minDistance = 20;\nlet maxDistance = 100;\nlet nextDistance = 0;\nlet lastMeteor = 0;\nlet speed = 0.6;\n\nMeteor.create = () => {\n    const meteorGeometry = new three__WEBPACK_IMPORTED_MODULE_0__[\"TetrahedronGeometry\"](10, 2);\n    const meteorMaterial = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color: _utils_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].red, shininess: 0, flatShading: true });\n    const meteor = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](meteorGeometry, meteorMaterial);\n    meteor.castShadow = true;\n    meteor.receiveShadow = true;\n\n    return meteor;\n}\n\nMeteor.spawn = () => {\n    const gameDistance = Math.floor(_game__WEBPACK_IMPORTED_MODULE_2__[\"default\"].getDistance());\n\n    if (nextDistance === 0) {\n        nextDistance = Math.floor(Math.random() * (maxDistance - minDistance) + minDistance);\n    }\n\n    if (gameDistance > (lastMeteor + nextDistance)) {\n        const meteor = Meteor.create();\n        meteor.angle = - Math.random();\n        meteor.distance = 800 + _vehicles_airplane__WEBPACK_IMPORTED_MODULE_3__[\"default\"].getDefaultHeight() + (-1 + Math.random() * 2) * (_vehicles_airplane__WEBPACK_IMPORTED_MODULE_3__[\"default\"].getAmpHeight() - 20);\n\n        lastMeteor = gameDistance;\n        nextDistance = 0;\n\n        meteors.add(meteor);\n        _game__WEBPACK_IMPORTED_MODULE_2__[\"default\"].getScene().add(meteor);\n    }\n}\n\nMeteor.rotate = (gameSpeed, deltaTime) => {\n    meteors.forEach((meteor, index) => {\n        meteor.angle += gameSpeed * deltaTime * speed;\n\n        if (meteor.angle > Math.PI * 2) {\n            meteor.angle -= Math.PI * 2;\n        } \n\n        meteor.position.y = -800 + Math.sin(meteor.angle) * meteor.distance;\n        meteor.position.x = Math.cos(meteor.angle) * meteor.distance;\n        meteor.rotation.z += Math.random() * 0.1;\n        meteor.rotation.y += Math.random() * 0.1;\n\n        const differenceInPosition = _vehicles_airplane__WEBPACK_IMPORTED_MODULE_3__[\"default\"].getPosition().clone().sub(meteor.position.clone());\n        if (differenceInPosition.length() < 12) {\n            _game__WEBPACK_IMPORTED_MODULE_2__[\"default\"].getScene().remove(meteor);\n            meteors.delete(meteor);\n\n            const planeCollisionSpeedX = 15 * differenceInPosition.x / differenceInPosition.length();\n            const planeCollisionSpeedY = 15 * differenceInPosition.y / differenceInPosition.length();\n            _vehicles_airplane__WEBPACK_IMPORTED_MODULE_3__[\"default\"].setPositionDisplacement(planeCollisionSpeedX, planeCollisionSpeedY);\n\n            return;\n        }\n\n        if (meteor.angle > Math.PI) {\n            meteors.delete(index, 1);\n            _game__WEBPACK_IMPORTED_MODULE_2__[\"default\"].getScene().remove(meteor);\n            return;\n        }\n    });\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Meteor);\n\n//# sourceURL=webpack:///./src/objects/landscape/meteor.js?");

/***/ }),

/***/ "./src/objects/landscape/sea.js":
/*!**************************************!*\
  !*** ./src/objects/landscape/sea.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/colors */ \"./src/utils/colors.js\");\n\n\n\nconst Sea = {},\n    seaRadius = 800,\n    seaLength = 800,\n    wavesMinAmp = 5,\n    wavesMaxAmp = 20,\n    wavesMinSpeed = 0.001,\n    wavesMaxSpeed = 0.003,\n    waves = [];\n\nlet sea = null;\n\nSea.create = () => {\n    const geometry = new three__WEBPACK_IMPORTED_MODULE_0__[\"CylinderGeometry\"](seaRadius, seaRadius, seaLength, 40, 10);\n    geometry.applyMatrix4(new three__WEBPACK_IMPORTED_MODULE_0__[\"Matrix4\"]().makeRotationX(-Math.PI/2));\n    geometry.mergeVertices();\n    geometry.vertices.forEach(vertice => {\n        waves.push({\n            y: vertice.y,\n            x: vertice.x,\n            z: vertice.z,\n            ang: Math.random() * Math.PI * 2,\n            amp: wavesMinAmp + Math.random() * (wavesMaxAmp - wavesMinAmp),\n            speed: wavesMinSpeed + Math.random() * (wavesMaxSpeed - wavesMinSpeed)\n        });\n    });\n\n    const material = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color: _utils_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].blue, flatShading: true, shininess: 0 });\n\n    sea = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](geometry, material);\n    sea.name = \"waves\";\n    sea.receiveShadow = true;\n    sea.position.y = -seaRadius;\n\n    return sea;\n}\n\nSea.update = (gameSpeed, deltaTime) => {\n    sea.rotation.z += gameSpeed * deltaTime;\n\n    if (sea.rotation.z > 2 * Math.PI) {\n        sea.rotation.z -= 2 * Math.PI;\n    }\n\n    const vertices = sea.geometry.vertices;\n    vertices.forEach((vertice, index) => {\n        const wave = waves[index];\n        vertice.x = wave.x + Math.cos(wave.ang) * wave.amp;\n        vertice.y = wave.y + Math.sin(wave.ang) * wave.amp;\n        wave.ang += wave.speed * deltaTime;\n        sea.geometry.verticesNeedUpdate = true;\n    });\n}\n\nSea.getRadius = () => seaRadius;\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Sea);\n\n//# sourceURL=webpack:///./src/objects/landscape/sea.js?");

/***/ }),

/***/ "./src/objects/landscape/sky.js":
/*!**************************************!*\
  !*** ./src/objects/landscape/sky.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _sea__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sea */ \"./src/objects/landscape/sea.js\");\n/* harmony import */ var _cloud__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./cloud */ \"./src/objects/landscape/cloud.js\");\n\n\n\n\nconst Sky = {};\n\nlet sky = null,\n    numberOfClouds = 20,\n    clouds = [];\n\nSky.create = () => {\n    sky = new three__WEBPACK_IMPORTED_MODULE_0__[\"Object3D\"]();\n    sky.name = \"sky\";\n\n    const stepAngle = Math.PI*2 / numberOfClouds;\n    for (let i = 0; i < numberOfClouds; i++) {\n        const angle = stepAngle * i;\n        const height = _sea__WEBPACK_IMPORTED_MODULE_1__[\"default\"].getRadius() + 150 + Math.random() * 200;\n        const scale = 1 + Math.random() * 2;\n        const cloud = _cloud__WEBPACK_IMPORTED_MODULE_2__[\"default\"].create();\n\n        cloud.position.y = Math.sin(angle) * height;\n        cloud.position.x = Math.cos(angle) * height;\n        cloud.position.z = -300 - Math.random() * 500;\n        cloud.rotation.z = angle + Math.PI / 2;\n        cloud.scale.set(scale, scale, scale);\n\n        clouds.push(cloud);\n        sky.add(cloud);\n    }\n\n    sky.position.y = -_sea__WEBPACK_IMPORTED_MODULE_1__[\"default\"].getRadius();\n    return sky;\n}\n\nSky.update = (gameSpeed, deltaTime) => {\n    clouds.forEach(cloud => _cloud__WEBPACK_IMPORTED_MODULE_2__[\"default\"].rotate(cloud));\n    sky.rotation.z += gameSpeed * deltaTime;\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Sky);\n\n//# sourceURL=webpack:///./src/objects/landscape/sky.js?");

/***/ }),

/***/ "./src/objects/vehicles/airplane.js":
/*!******************************************!*\
  !*** ./src/objects/vehicles/airplane.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/utils */ \"./src/utils/utils.js\");\n/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/colors */ \"./src/utils/colors.js\");\n/* harmony import */ var _input_inputHandler__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../input/inputHandler */ \"./src/input/inputHandler.js\");\n\n\n\n\n\nconst AirPlane = {};\n\nlet airplane = null;\n\nlet planeDefaultHeight = 100,\n    planeAmpHeight = 70,\n    planeAmpWidth = 75,\n    planeMoveSensivity = 3.5,\n    planeRotXSensivity = 0.8,\n    planeRotZSensivity = 0.4,\n    planeMinSpeed = 1.2,\n    planeMaxSpeed = 1.6,\n    planeSpeed = 0,\n    planeCollisionDisplacementX = 0,\n    planeCollisionSpeedX = 0,\n    planeCollisionDisplacementY = 0,\n    planeCollisionSpeedY = 0;\n\nAirPlane.create = () => {\n    airplane = new three__WEBPACK_IMPORTED_MODULE_0__[\"Object3D\"]();\n    airplane.name = \"AirPlane\";\n\n    const cabin = createCabin();\n    airplane.add(cabin);\n    \n    const engine = createEngine();\n    airplane.add(engine);\n\n    const tale = createTale();\n    airplane.add(tale);\n\n    const wings = createWings();\n    airplane.add(wings);\n\n    const windshield = createWindShield();\n    airplane.add(windshield);\n\n    const propellor = createPropellor();\n    airplane.add(propellor);\n\n    const tires = createTires();\n    airplane.add(tires);\n\n    airplane.scale.set(.25,.25,.25);\n    airplane.position.y = planeDefaultHeight;\n    airplane.position.x = -(window.innerWidth);\n\n    return airplane;\n}\n\nAirPlane.update = deltaTime => {\n    planeSpeed = _utils_utils__WEBPACK_IMPORTED_MODULE_1__[\"default\"].normalize(_input_inputHandler__WEBPACK_IMPORTED_MODULE_3__[\"default\"].mousePos.x, -.5, .5, planeMinSpeed, planeMaxSpeed);\n    \n    let targetY = _utils_utils__WEBPACK_IMPORTED_MODULE_1__[\"default\"].normalize(_input_inputHandler__WEBPACK_IMPORTED_MODULE_3__[\"default\"].mousePos.y, -.75, .75, planeDefaultHeight - planeAmpHeight, planeDefaultHeight + planeAmpHeight);\n    let targetX = _utils_utils__WEBPACK_IMPORTED_MODULE_1__[\"default\"].normalize(_input_inputHandler__WEBPACK_IMPORTED_MODULE_3__[\"default\"].mousePos.x, -.75, .75, -planeAmpWidth * .7, -planeAmpWidth * 2);\n\n    planeCollisionDisplacementX += planeCollisionSpeedX;\n    targetX += planeCollisionDisplacementX;\n\n    planeCollisionDisplacementY += planeCollisionSpeedY;\n    targetY += planeCollisionDisplacementY;\n\n    airplane.position.y += (targetY - airplane.position.y) * deltaTime * planeMoveSensivity;\n    airplane.position.x += (targetX - airplane.position.x) * deltaTime * planeMoveSensivity;\n\n    airplane.rotation.z = (targetY - airplane.position.y) * deltaTime * planeRotXSensivity;\n    airplane.rotation.x = (airplane.position.y - targetY) * deltaTime * planeRotZSensivity;\n\n    planeCollisionSpeedX += (0 - planeCollisionSpeedX) * deltaTime * planeMoveSensivity;\n    planeCollisionDisplacementX += (0 - planeCollisionDisplacementX) * deltaTime * planeMoveSensivity;\n    planeCollisionSpeedY += ( 0 - planeCollisionSpeedY) * deltaTime * planeMoveSensivity;\n    planeCollisionDisplacementY += (0 - planeCollisionDisplacementY) * deltaTime * planeMoveSensivity;\n\n    // Rotating the propellor.\n    airplane.children.some(child => {\n        if (child.name === \"propellor\") {\n            child.rotation.x += .2 + planeSpeed * deltaTime * .005;\n        }\n    });\n}\n\nAirPlane.setPositionDisplacement = (collisionSpeedX, collisionSpeedY) => {\n    console.log(collisionSpeedX, collisionSpeedY);\n    planeCollisionSpeedX = collisionSpeedX;\n    planeCollisionSpeedY = collisionSpeedY;\n}\n\nAirPlane.reset = () => {\n    planeDefaultHeight = 100,\n    planeAmpHeight = 80,\n    planeAmpWidth = 105,\n    planeMoveSensivity = 2,\n    planeRotXSensivity = 0.6,\n    planeRotZSensivity = 0.4,\n    planeMinSpeed = 1.2,\n    planeMaxSpeed = 1.6,\n    planeSpeed = 0,\n    planeCollisionDisplacementX = 0,\n    planeCollisionSpeedX = 0,\n    planeCollisionDisplacementY = 0,\n    planeCollisionSpeedY = 0;\n}\n\nAirPlane.getPosition = () => airplane.position;\n\nAirPlane.getSpeed = () => planeSpeed;\n\nAirPlane.getDefaultHeight = () => planeDefaultHeight;\n\nAirPlane.getAmpHeight = () => planeAmpHeight;\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (AirPlane);\n\nconst createCabin = () => {\n    const cabinGeometry = new three__WEBPACK_IMPORTED_MODULE_0__[\"BoxGeometry\"](80, 50, 50, 1, 1, 1);\n    const cabinMaterial = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color: _utils_colors__WEBPACK_IMPORTED_MODULE_2__[\"default\"].red, flatShading: true });\n\n    cabinGeometry.vertices[4].y-=10;\n    cabinGeometry.vertices[4].z+=20;\n    cabinGeometry.vertices[5].y-=10;\n    cabinGeometry.vertices[5].z-=20;\n    cabinGeometry.vertices[6].y+=30;\n    cabinGeometry.vertices[6].z+=20;\n    cabinGeometry.vertices[7].y+=30;\n    cabinGeometry.vertices[7].z-=20;  \n\n    const cabin = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](cabinGeometry, cabinMaterial);\n    cabin.castShadow = true;\n    cabin.receiveShadow = true;\n\n    cabin.name = \"cabin\";\n\n    return cabin;\n}\n\nconst createEngine = () => {\n    const engineGeometry = new three__WEBPACK_IMPORTED_MODULE_0__[\"BoxGeometry\"](20, 50, 50, 1, 1, 1);\n    const engineMaterial = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color: _utils_colors__WEBPACK_IMPORTED_MODULE_2__[\"default\"].white, flatShading: true });\n\n    const engine = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](engineGeometry, engineMaterial);\n    engine.position.x = 40;\n    engine.castShadow = true;\n    engine.receiveShadow = true;\n    engine.name = \"engine\";\n\n    return engine;\n}\n\nconst createTale = () => {\n    const taleGeometry = new three__WEBPACK_IMPORTED_MODULE_0__[\"BoxGeometry\"](15, 20, 5, 1, 1, 1);\n    const taleMaterial = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color: _utils_colors__WEBPACK_IMPORTED_MODULE_2__[\"default\"].black });\n\n    const tale = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](taleGeometry, taleMaterial);\n    tale.position.set(-40, 20, 0);\n    tale.castShadow = true;\n    tale.receiveShadow = true;\n    tale.name = \"tale\";\n\n    return tale;\n}\n\nconst createWings = () => {\n    const wingsGeometry = new three__WEBPACK_IMPORTED_MODULE_0__[\"BoxGeometry\"](30, 10, 120, 1, 1, 1);\n    const wingsMaterial = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color: _utils_colors__WEBPACK_IMPORTED_MODULE_2__[\"default\"].red, flatShading: true });\n\n    const wings = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](wingsGeometry, wingsMaterial);\n    wings.position.set(0, 15, 0);\n    wings.castShadow = true;\n    wings.receiveShadow = true;\n    wings.name = \"wings\";\n\n    return wings;\n}\n\nconst createWindShield = () => {\n  const windShieldGeometry = new three__WEBPACK_IMPORTED_MODULE_0__[\"BoxGeometry\"](3,15,20,1,1,1);\n  const windShieldMaterial = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color: _utils_colors__WEBPACK_IMPORTED_MODULE_2__[\"default\"].white, transparent: true, opacity: .3, flatShading: true });\n  \n  const windshield = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](windShieldGeometry, windShieldMaterial);\n  windshield.position.set(5,27,0);\n  windshield.castShadow = true;\n  windshield.receiveShadow = true;\n\n  return windshield;\n}\n\nconst createPropellor = () => {\n    const propGeometry = new three__WEBPACK_IMPORTED_MODULE_0__[\"BoxGeometry\"](20, 10, 10, 1, 1, 1);\n    const propMaterial = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color: _utils_colors__WEBPACK_IMPORTED_MODULE_2__[\"default\"].black, flatShading: true });\n\n    propGeometry.vertices[4].y-=5;\n    propGeometry.vertices[4].z+=5;\n    propGeometry.vertices[5].y-=5;\n    propGeometry.vertices[5].z-=5;\n    propGeometry.vertices[6].y+=5;\n    propGeometry.vertices[6].z+=5;\n    propGeometry.vertices[7].y+=5;\n    propGeometry.vertices[7].z-=5;\n\n    const propellor = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](propGeometry, propMaterial);\n    propellor.position.set(60, 0, 0);\n    propellor.castShadow = true;\n    propellor.receiveShadow = true;\n    propellor.name = \"propellor\";\n\n    const blade1 = createBlade();\n    blade1.position.set(8, 0, 0);\n    blade1.name = \"blade1\";\n\n    const blade2 = blade1.clone();\n    blade2.rotation.x = Math.PI/2;\n    blade2.name = \"blade2\";\n\n    propellor.add(blade1);\n    propellor.add(blade2);\n\n    return propellor;\n}\n\nconst createBlade = () => {\n    const bladeGeometry = new three__WEBPACK_IMPORTED_MODULE_0__[\"BoxGeometry\"](1,80,10,1,1,1);   \n    const bladeMaterial = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color: _utils_colors__WEBPACK_IMPORTED_MODULE_2__[\"default\"].lightBlack, flatShading: true });\n\n    const blade = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](bladeGeometry, bladeMaterial);\n    blade.castShadow = true;\n    blade.receiveShadow = true;\n\n    return blade;\n}\n\nconst createTires = () => {\n    const tires = new three__WEBPACK_IMPORTED_MODULE_0__[\"Object3D\"]();\n    var wheelProtecGeom = new three__WEBPACK_IMPORTED_MODULE_0__[\"BoxGeometry\"](30,15,10,1,1,1);\n    var wheelProtecMat = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color:_utils_colors__WEBPACK_IMPORTED_MODULE_2__[\"default\"].red, flatShading: true });\n    var wheelProtecR = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](wheelProtecGeom,wheelProtecMat);\n    wheelProtecR.position.set(25,-20,25);\n    tires.add(wheelProtecR);\n\n    var wheelTireGeom = new three__WEBPACK_IMPORTED_MODULE_0__[\"BoxGeometry\"](24,24,4);\n    var wheelTireMat = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color:_utils_colors__WEBPACK_IMPORTED_MODULE_2__[\"default\"].black, flatShading: true });\n    var wheelTireR = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](wheelTireGeom,wheelTireMat);\n    wheelTireR.position.set(25,-28,25);\n\n    var wheelAxisGeom = new three__WEBPACK_IMPORTED_MODULE_0__[\"BoxGeometry\"](10,10,6);\n    var wheelAxisMat = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color:_utils_colors__WEBPACK_IMPORTED_MODULE_2__[\"default\"].lightBlack, flatShading: true });\n    var wheelAxis = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](wheelAxisGeom,wheelAxisMat);\n    wheelTireR.add(wheelAxis);\n\n    tires.add(wheelTireR);\n\n    var wheelProtecL = wheelProtecR.clone();\n    wheelProtecL.position.z = -wheelProtecR.position.z ;\n    tires.add(wheelProtecL);\n\n    var wheelTireL = wheelTireR.clone();\n    wheelTireL.position.z = -wheelTireR.position.z;\n    tires.add(wheelTireL);\n\n    var wheelTireB = wheelTireR.clone();\n    wheelTireB.scale.set(.5,.5,.5);\n    wheelTireB.position.set(-35,-5,0);\n    tires.add(wheelTireB);\n\n    var suspensionGeom = new three__WEBPACK_IMPORTED_MODULE_0__[\"BoxGeometry\"](4,20,4);\n    suspensionGeom.applyMatrix4(new three__WEBPACK_IMPORTED_MODULE_0__[\"Matrix4\"]().makeTranslation(0,10,0))\n    var suspensionMat = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color:_utils_colors__WEBPACK_IMPORTED_MODULE_2__[\"default\"].red, flatShading: true });\n    var suspension = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](suspensionGeom,suspensionMat);\n    suspension.position.set(-35,-5,0);\n    suspension.rotation.z = -.3;\n    tires.add(suspension);\n\n    return tires;\n}\n\n//# sourceURL=webpack:///./src/objects/vehicles/airplane.js?");

/***/ }),

/***/ "./src/objects/weapons/basicWeapon.js":
/*!********************************************!*\
  !*** ./src/objects/weapons/basicWeapon.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _utils_colors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/colors */ \"./src/utils/colors.js\");\n/* harmony import */ var _vehicles_airplane__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../vehicles/airplane */ \"./src/objects/vehicles/airplane.js\");\n/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../game */ \"./src/game.js\");\n\n\n\n\n\nconst BasicWeapon = {};\nconst bullitSpeed = 100;\nconst bullits = [];\n\nBasicWeapon.create = () => {\n    const bullit = new three__WEBPACK_IMPORTED_MODULE_0__[\"Object3D\"]();\n\n    const bullitBaseGeometry = new three__WEBPACK_IMPORTED_MODULE_0__[\"CylinderGeometry\"](2, 2, 5, 8, 1);\n    const bullitBaseMaterial = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color: _utils_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].black, flatShading: true });\n    const bullitBase = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](bullitBaseGeometry, bullitBaseMaterial);\n    bullitBase.rotation.z = Math.PI / 2;\n    bullitBase.receiveShadow = true;\n    bullitBase.castShadow = true;\n\n    const bullitHeadGeometry = new three__WEBPACK_IMPORTED_MODULE_0__[\"SphereGeometry\"](2, 10, 10);\n    const bullitHeadMaterial = new three__WEBPACK_IMPORTED_MODULE_0__[\"MeshPhongMaterial\"]({ color: _utils_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].black, flatShading: true });\n    const bullitHead = new three__WEBPACK_IMPORTED_MODULE_0__[\"Mesh\"](bullitHeadGeometry, bullitHeadMaterial);\n    bullitHead.position.x = 3;\n    bullitHead.receiveShadow = true;\n    bullitHead.castShadow = true;\n\n    bullit.add(bullitBase);\n    bullit.add(bullitHead);\n\n    return bullit;\n}\n\nBasicWeapon.add = bullit => {\n    bullit.position.x = _vehicles_airplane__WEBPACK_IMPORTED_MODULE_2__[\"default\"].getPosition().x + 15;\n    bullit.position.y = _vehicles_airplane__WEBPACK_IMPORTED_MODULE_2__[\"default\"].getPosition().y;\n    bullits.push(bullit);\n}\n\nBasicWeapon.fire = deltaTime => {\n    bullits.forEach(bullit => {\n        bullit.position.x += (bullitSpeed * deltaTime);\n    });\n\n    bullits.forEach((bullit, index) => {\n        if (bullit.position.x > window.innerWidth) {\n            bullits.splice(index, 1);\n            _game__WEBPACK_IMPORTED_MODULE_3__[\"default\"].getScene().remove(bullit);\n        }\n    });\n}\n\nBasicWeapon.hasBullits = () => bullits.length;\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (BasicWeapon);\n\n//# sourceURL=webpack:///./src/objects/weapons/basicWeapon.js?");

/***/ }),

/***/ "./src/utils/colors.js":
/*!*****************************!*\
  !*** ./src/utils/colors.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nconst Colors = {\n    white: 0xffffff,\n\toffWhite: 0xd8d0d1,\n    blue: 0xA8E6CE,\n    green: 0xDCEDC2,\n    orange: 0xFFD3B5,\n    red: 0xFF8C94,\n    black: 0x2A363B,\n    lightBlack: 0x5A5050\n};\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Colors);\n\n//# sourceURL=webpack:///./src/utils/colors.js?");

/***/ }),

/***/ "./src/utils/utils.js":
/*!****************************!*\
  !*** ./src/utils/utils.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nconst Utils = {}\n\nUtils.normalize = (v, vmin, vmax, tmin, tmax) => {\n    const nv = Math.max(Math.min(v,vmax), vmin);\n    const dv = vmax - vmin;\n    const pc = (nv - vmin) / dv;\n    const dt = tmax - tmin;\n    const tv = tmin + (pc * dt);\n\n    return tv;\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Utils);\n\n//# sourceURL=webpack:///./src/utils/utils.js?");

/***/ })

/******/ });