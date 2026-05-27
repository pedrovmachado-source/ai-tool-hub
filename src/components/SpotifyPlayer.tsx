
export default function SpotifyPlayer() {
  return (
    <div className="w-full max-w-[800px] mx-auto rounded-xl overflow-hidden shadow-2xl bg-black/40 backdrop-blur-sm p-1 mb-8">
      <iframe 
        style={{ borderRadius: '12px' }}
        src="https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0Ex3X?utm_source=generator&theme=0" 
        width="100%" 
        height="152" 
        frameBorder="0" 
        allowFullScreen={true} 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
      ></iframe>
    </div>
  );
}
