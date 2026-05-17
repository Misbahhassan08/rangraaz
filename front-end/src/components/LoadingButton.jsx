import React from "react";

const LoadingButton = ({
  loading = false,
  children,
  loadingText = "Working",
  className = "",
  disabled,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={`relative inline-flex items-center justify-center gap-2 overflow-hidden disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    {...props}
  >
    {loading && <span className="api-loader" aria-hidden="true" />}
    <span className={loading ? "opacity-90" : ""}>{loading ? loadingText : children}</span>
  </button>
);

export default LoadingButton;
