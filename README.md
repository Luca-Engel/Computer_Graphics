# 🔥 Fire Simulation Project  

## 📌 Overview  
This project implements a **real-time fire simulation** using particle systems, billboarding, noise functions, and Bézier curves. The goal was to create realistic and dynamic fire effects while keeping computational efficiency in mind.  

Particles are spawned according to a Gaussian distribution, change their size over time using Bézier curves, and dissipate naturally. The system supports both **realistic fires** (orange/yellow) and **magic fires** (blue, green, etc.), along with smoke, rocks, and camera animations.  

---

## 🧠 Methods  

### Particle System  
- **Gaussian spawning** of fire particles around the origin.  
- Size adjustments over time with **Bézier curves**.  
- Dissipation of particles after a lifespan.  
- Blending for realistic brightness when particles overlap.  

### Rendering & Efficiency  
- **Billboards** (two-triangle meshes) used instead of spheres for performance.  
- Orientation corrected to always face the camera.  
- Black pixel removal and Gaussian masking to avoid square textures.  
- Sorting particles by camera distance to ensure correct blending.  

### Fire & Smoke Effects  
- **Fire textures** with customizable colors (normal, blue, green, etc.).  
- **Smoke particles** generated using **Perlin noise**–based cloud textures.  
- Blending with rocks and environment for smooth visual transitions.  

### Scene & Environment  
- **Rock meshes** placed around the firepit, adapted in Blender.  
- Textures adapted for realistic stone appearance.  
- Multiple firepits, including magic-colored ones, rendered simultaneously.  

### Camera Movement  
- Automatic camera paths generated with **Bézier curves**.  
- Implemented using **de Casteljau’s algorithm** for smooth interpolation.  
- Supports both manual control and predefined animated paths.  

---

## 🎯 Features  
- Realistic fire and smoke simulation.  
- Support for **magic-colored firepits**.  
- Blending for visual realism.  
- Rocks and textures for an immersive environment.  
- Camera paths with Bézier curves.  

---

## ▶️ Demo  
- 🎥 [Video demonstration](https://drive.google.com/file/d/1nv01i-_LBP0dGE9w3LMWFoOMRij2_zeJ/view)  
- 🌐 [Interactive demo](/Project/fire/index_fire.html) (must be run locally)

---

## 📦 Technologies  
- **OpenGL / WebGL** (particle rendering & shaders)  
- **Perlin noise** for smoke textures  
- **Blender** (environment meshes)  
- **Bézier curves** (particle scaling, camera paths)  

---

## 🙌 Contributors  
- **Luca Engel** – Particle blending, billboarding, smoke rendering, rocks  
- **Ahmad Jarrar** – Particle scaling (Bézier), camera curves, spherical fire prototype  
- **Antoine Garin** – Initial setup, reporting, video demos, Perlin noise contribution  

---

## 📚 Resources  
- [OpenGL Tutorial – Billboards & Particles](http://www.opengl-tutorial.org/intermediate-tutorials/billboards-particles/particles-instancing/)  
- [Blending in OpenGL](https://learnopengl.com/Advanced-OpenGL/Blending)  
- [Fire effect example on Shadertoy](https://www.shadertoy.com/view/lsdBD2)  
- [3D Rock Mesh](https://www.turbosquid.com/3d-models/3d-short-flat-rocks-1909649)  
- [Stone Texture](https://www.shutterstock.com/image-photo/black-stone-concrete-texture-background-anthracite-1617633904)  

