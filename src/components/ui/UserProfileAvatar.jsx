import React from "react";
import { UserRound } from "lucide-react";

const UserProfileAvatar = ({
  src,
  position = "50% 50%",
  name = "",
  gender = "",
  className = "h-9 w-9",
}) => {
  const isFemale = String(gender).toUpperCase().startsWith("P");

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-sm ${
        src ? "bg-slate-100" : isFemale ? "bg-pink-100 text-pink-600" : "bg-sky-100 text-sky-600"
      } ${className}`}
      title={name || "Profil siswa"}
    >
      {src ? (
        <img
          src={src}
          alt={`Foto profil ${name || "siswa"}`}
          className="h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
      ) : (
        <UserRound size={18} aria-hidden="true" />
      )}
    </div>
  );
};

export default React.memo(UserProfileAvatar);
