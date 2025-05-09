import { useRef } from "react";
import { Star } from "lucide-react";

export default function AssetGrid({ assets, onSelect, setAssets, onlyFavorites = false, category = null }) {
  const isVideo = (path) => path?.endsWith(".webm") || path?.endsWith(".mp4");
  const isImage = (path) => path?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  const toggleFavorite = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/assets/${id}/favorite`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Fehler beim Favoritenstatus");

      const updatedAsset = await response.json();

      setAssets((prev) => {
        if ((onlyFavorites || category === "Favorites") && !updatedAsset.is_favorite) {
          return prev.filter((item) => item.id !== id);
        } else {
          return prev.map((item) => (item.id === id ? updatedAsset : item));
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getPreviewPath = (asset) => {
    if (asset.preview_image) return asset.preview_image;

    const files = asset.media_files || [];
    const firstMedia = files.find((f) => isImage(f) || isVideo(f));
    return firstMedia || null;
  };

  const filteredAssets =
    category === "Favorites"
      ? assets.filter((asset) => asset.is_favorite)
      : category === "All Assets"
      ? assets
      : onlyFavorites
      ? assets.filter((asset) => asset.is_favorite)
      : assets;

  return (
    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 space-y-4 px-2">
      {filteredAssets.map((asset) => {
        const previewPath = getPreviewPath(asset);
        const fullPath = previewPath ? `http://localhost:8000${previewPath}` : null;

        return (
          <div
            key={asset.id}
            onClick={() => onSelect(asset)}
            className="break-inside-avoid relative group cursor-pointer bg-box rounded-lg shadow hover:shadow-xl transition overflow-hidden border border-[#2f2f2f]"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(asset.id);
              }}
              className={`absolute top-2 left-2 p-1 rounded-full z-10 bg-black bg-opacity-60 hover:bg-opacity-80 transition-colors ${
                asset.is_favorite ? "text-yellow-400" : "text-gray-300"
              }`}
              title={asset.is_favorite ? "Favorit entfernen" : "Als Favorit markieren"}
            >
              <Star fill={asset.is_favorite ? "currentColor" : "none"} />
            </button>

            {isVideo(previewPath) ? (
              <VideoHoverPreview src={fullPath} />
            ) : (
              <img
                src={fullPath || "/fallback.jpg"}
                alt={asset.name}
                className="w-full object-contain border-b border-[#2f2f2f] bg-black"
              />
            )}

            <div className="p-3">
              <h3 className="text-primary text-base font-semibold mb-1">{asset.name}</h3>
              <p className="text-sm text-text opacity-70">{asset.type}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VideoHoverPreview({ src }) {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      preload="metadata"
      playsInline
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full object-contain border-b border-[#2f2f2f] bg-black"
    />
  );
}
