"use client";

export default function ConsentSettingsButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-consent-manager"))}
      className={className}
    >
      إدارة الموافقة على الكوكيز
    </button>
  );
}
