export const getPlayerHtml = (eventName: string, mediaList: any[]) => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QRFoto - ${eventName}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sacramento&family=Outfit:wght@300;400;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #050505;
            --accent: #8b5cf6;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: var(--bg); 
            color: white; 
            font-family: 'Outfit', sans-serif; 
            overflow-x: hidden;
        }
        .container { padding: 4rem 2rem; max-width: 1400px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 4rem; }
        .header h1 { font-family: 'Sacramento', cursive; font-size: 5rem; color: var(--accent); margin-bottom: 1rem; }
        .header p { text-transform: uppercase; letter-spacing: 0.5em; opacity: 0.3; font-size: 0.7rem; font-weight: 900; }
        
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
            gap: 1.5rem;
        }
        .item { 
            position: relative; 
            aspect-ratio: 1/1; 
            background: #111; 
            overflow: hidden; 
            border-radius: 1.5rem;
            cursor: pointer;
            transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .item:hover { transform: scale(1.02); z-index: 10; }
        .item img, .item video { 
            width: 100%; height: 100%; object-fit: cover; 
            transition: opacity 0.5s;
        }
        .item .overlay {
            position: absolute; inset: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
            padding: 1.5rem; display: flex; flex-direction: column; justify-content: flex-end;
            opacity: 0; transition: opacity 0.3s;
        }
        .item:hover .overlay { opacity: 1; }
        .item .message { font-size: 0.8rem; font-weight: 300; line-height: 1.4; opacity: 0.9; }
        .item .author { font-size: 0.6rem; text-transform: uppercase; font-weight: 900; margin-top: 0.5rem; color: var(--accent); }

        /* Fullscreen Slideshow */
        #slideshow {
            position: fixed; inset: 0; background: black; z-index: 1000;
            display: none; justify-content: center; align-items: center;
        }
        #slideshow.active { display: flex; }
        #slideshow img, #slideshow video { max-width: 90%; max-height: 90%; object-fit: contain; }
        #slideshow .controls {
            position: absolute; bottom: 3rem; left: 50%; transform: translateX(-50%);
            display: flex; gap: 2rem; align-items: center;
        }
        .btn { 
            background: white; border: none; padding: 0.8rem 1.5rem; 
            border-radius: 1rem; font-weight: 900; text-transform: uppercase; 
            cursor: pointer; cursor: pointer;
        }
        #close { position: absolute; top: 2rem; right: 2rem; font-size: 2rem; cursor: pointer; opacity: 0.5; }
        #close:hover { opacity: 1; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 id="event-name">${eventName}</h1>
            <p>QRFoto Memories • Export Bundle</p>
        </div>
        <div class="grid" id="gallery"></div>
    </div>

    <div id="slideshow">
        <div id="close">&times;</div>
        <div id="media-content"></div>
        <div class="controls">
            <button class="btn" onclick="prev()">Prev</button>
            <button class="btn" onclick="next()">Next</button>
        </div>
    </div>

    <script>
        const media = ${JSON.stringify(mediaList)};
        const gallery = document.getElementById('gallery');
        const slideshow = document.getElementById('slideshow');
        const content = document.getElementById('media-content');
        let currentIdx = 0;

        function render() {
            media.forEach((item, idx) => {
                const div = document.createElement('div');
                div.className = 'item';
                div.onclick = () => openStats(idx);
                
                const isVideo = item.file_type === 'video';
                const el = isVideo ? document.createElement('video') : document.createElement('img');
                el.src = './' + item.filename;
                if (isVideo) { el.muted = true; el.loop = true; }
                
                const overlay = document.createElement('div');
                overlay.className = 'overlay';
                overlay.innerHTML = \`<p class="message">\${item.message || ''}</p><p class="author">\${item.guest_name || 'Invitado'}</p>\`;
                
                div.appendChild(el);
                div.appendChild(overlay);
                gallery.appendChild(div);
            });
        }

        function openStats(idx) {
            currentIdx = idx;
            slideshow.classList.add('active');
            updateSlideshow();
        }

        function updateSlideshow() {
            const item = media[currentIdx];
            content.innerHTML = '';
            const isVideo = item.file_type === 'video';
            const el = isVideo ? document.createElement('video') : document.createElement('img');
            el.src = './' + item.filename;
            if (isVideo) { el.controls = true; el.autoplay = true; }
            content.appendChild(el);
        }

        function next() { currentIdx = (currentIdx + 1) % media.length; updateSlideshow(); }
        function prev() { currentIdx = (currentIdx - 1 + media.length) % media.length; updateSlideshow(); }

        document.getElementById('close').onclick = () => slideshow.classList.remove('active');
        document.onkeydown = (e) => {
            if (e.key === 'Escape') slideshow.classList.remove('active');
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        }

        render();
    </script>

    <!-- Branding Footer -->
    <footer style="margin-top: 10rem; padding: 6rem 2rem; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; background: #000;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 300; text-transform: uppercase; letter-spacing: 0.5em; font-size: 1rem; margin-bottom: 0.5rem; color: #fff;">QRFoto</h2>
        <p style="text-transform: uppercase; font-size: 0.65rem; font-weight: 900; color: #8b5cf6; letter-spacing: 0.3rem; margin-bottom: 2rem;">Memorias Colaborativas en Tiempo Real</p>
        <p style="max-width: 500px; margin: 0 auto; font-size: 0.8rem; opacity: 0.4; line-height: 1.8; margin-bottom: 3rem;">Captura cada momento de tus invitados con una galería en vivo e interactiva. Crea tu propia experiencia profesional.</p>
        <a href="https://qrfoto.events" style="display: inline-block; padding: 1.2rem 2.5rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 1.2rem; color: #fff; text-decoration: none; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3rem; transition: all 0.3s;" onmouseover="this.style.background='white'; this.style.color='black'; this.style.borderColor='white'" onmouseout="this.style.background='transparent'; this.style.color='white'; this.style.borderColor='rgba(255,255,255,0.1)'">
            Ir a qrfoto.events
        </a>
    </footer>
</body>
</html>
  `;
};
