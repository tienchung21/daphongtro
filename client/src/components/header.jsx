import "./header.css";
import logo from "../assets/images/Hommy_Logo_Web.svg";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import yeuThichApi from "../api/yeuThichApi";
import { getStaticUrl } from "../config/api";
import { HiOutlineLanguage, HiOutlineSun, HiOutlineMoon, HiOutlineLightBulb, HiOutlineArrowDownTray } from "react-icons/hi2";
import { useLanguage, useTranslation } from "../context/LanguageContext";

function Header() {
  const [showFavorites, setShowFavorites] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  // PWA Install prompt handler
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false);
    }
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  // Load saved preferences
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

  // lấy user từ localStorage (với cấu trúc bạn đã paste: { user: { ... } })
  useEffect(() => {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("currentUser") ||
      localStorage.getItem("nguoidung");
    if (!raw) {
      const idKey = localStorage.getItem("userId");
      if (idKey && !isNaN(Number(idKey)))
        setCurrentUser({ NguoiDungID: Number(idKey) });
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      const actual = parsed.user ?? parsed;
      const id = actual?.NguoiDungID ?? actual?.id ?? actual?.userId;
      const name =
        actual?.TenDayDu ?? actual?.Ten ?? actual?.fullname ?? actual?.name;
      setCurrentUser({ ...actual, NguoiDungID: id, TenDayDu: name });
    } catch (e) {
      // not JSON -> ignore
      const num = Number(raw);
      if (!isNaN(num)) setCurrentUser({ NguoiDungID: num });
    }
  }, []);

  // load favorites khi có userId
  useEffect(() => {
    if (!currentUser?.NguoiDungID) return;
    (async () => {
      setFavLoading(true);
      try {
        const res = await yeuThichApi.listWithTinDetails(
          currentUser.NguoiDungID
        );
        const raw = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setFavorites(raw);
      } catch (err) {
        console.error("Lỗi lấy yêu thích:", err?.response?.data || err.message);
        setFavorites([]);
      } finally {
        setFavLoading(false);
      }
    })();
  }, [currentUser]);

  const handleRemoveFav = async (item) => {
    if (!currentUser?.NguoiDungID) return;
    const tin = item.TinDang ?? item.tinDang ?? item;
    const tinId = tin?.TinDangID ?? tin?.id ?? tin?._id;
    if (!tinId) return;
    if (!window.confirm(t('header.confirmRemove'))) return;
    try {
      await yeuThichApi.remove(currentUser.NguoiDungID, tinId);
      setFavorites((prev) =>
        prev.filter((f) => {
          const fi =
            (f.TinDang ?? f).TinDangID ??
            (f.TinDang ?? f).id ??
            (f.TinDang ?? f)._id;
          return fi !== tinId;
        })
      );
    } catch (err) {
      console.error("Lỗi xóa yêu thích:", err?.response?.data || err.message);
      alert(t('header.removeFailed'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    sessionStorage.clear();
    setCurrentUser(null);
    setFavorites([]);
    // Force reload và redirect về login
    window.location.href = "/login";
  };

  const resolveImageSrc = (value) => {
    if (!value) return null;

    const normalizeCandidates = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input;
      if (typeof input === "string") {
        if (input.trim().startsWith("[")) {
          try {
            const parsed = JSON.parse(input);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [input];
          }
        }
        return [input];
      }
      return [input];
    };

    const firstCandidate = normalizeCandidates(value).find(Boolean);
    if (!firstCandidate || typeof firstCandidate !== "string") return null;
    return getStaticUrl(firstCandidate);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="header__container">
        <div className="header__logo">
          <img src={logo} alt="Logo" />
        </div>

        <button
          className="header__menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          type="button"
        >
          <span className="header__menu-toggle-line"></span>
          <span className="header__menu-toggle-line"></span>
          <span className="header__menu-toggle-line"></span>
        </button>

        <nav className={`header__nav ${mobileMenuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__nav-list">
            <li className="header__nav-item">
              <Link to="/" className="header__nav-link" onClick={closeMobileMenu}>
                {t('header.home')}
              </Link>
            </li>
            <li className="header__nav-item">
              <Link to="/blog" className="header__nav-link" onClick={closeMobileMenu}>
                {t('header.blog')}
              </Link>
            </li>
            <li className="header__nav-item">
              <Link to="/bang-gia" className="header__nav-link" onClick={closeMobileMenu}>
                {t('header.priceList')}
              </Link>
            </li>
            <li className="header__nav-item">
              <Link to="/quan-ly" className="header__nav-link" onClick={closeMobileMenu}>
                {t('header.management')}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Header Actions Group - Install, Language, Theme, Favorites */}
        <div className="header__actions">
          {/* PWA Install Button */}
          {canInstall && (
            <button
              className="header__install-btn"
              onClick={handleInstallClick}
              type="button"
              aria-label="Tải xuống ứng dụng"
              title="Cài đặt ứng dụng Hommy"
            >
              <HiOutlineArrowDownTray className="header__install-icon" />
              <span className="header__install-text">{t('header.installApp') || 'Tải ứng dụng'}</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            className="header__action-btn header__action-btn--language"
            onClick={toggleLanguage}
            type="button"
            aria-label="Đổi ngôn ngữ"
            title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          >
            <HiOutlineLanguage className="header__action-icon" />
            <span className="header__action-text">{language === 'vi' ? 'VI' : 'EN'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            className="header__action-btn header__action-btn--theme"
            onClick={toggleDarkMode}
            type="button"
            aria-label="Chế độ sáng/tối"
            title={darkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            {darkMode ? (
              <HiOutlineSun className="header__action-icon" />
            ) : (
              <HiOutlineLightBulb className="header__action-icon" />
            )}
          </button>
        </div>

        <div className="header__favorites">
          <button
            className="header__favorites-btn"
            onClick={() => setShowFavorites(!showFavorites)}
            type="button"
            aria-label="Yêu thích"
          >
            🩶{favorites.length > 0 ? ` ${favorites.length}` : ""}
          </button>

          {showFavorites && (
            <div className="header__favorites-dropdown">
              <h4 className="header__favorites-title">{t('header.favoritesList')}</h4>

              {favLoading && (
                <div className="header__favorites-loading">{t('header.favoritesLoading')}</div>
              )}

              {!favLoading && favorites.length === 0 && (
                <div className="header__favorites-empty">{t('header.favoritesEmpty')}</div>
              )}

              {!favLoading &&
                favorites.map((f) => {
                  const tin = f.TinDang ?? f.tinDang ?? f;
                  const id =
                    tin?.TinDangID ?? tin?.TinDangId ?? tin?.id ?? tin?._id;
                  const title = tin?.TieuDe ?? tin?.title ?? "Không có tiêu đề";

                  // Sử dụng getStaticUrl() để tự động xử lý URL theo môi trường
                  const imgSrc = tin?.Img
                    ? getStaticUrl(tin.Img)
                    : tin?.URL
                    ? getStaticUrl(tin.URL)
                    : "https://via.placeholder.com/80x60?text=No+Img";

                  return (
                    <div className="header__favorites-item" key={id}>
                      <div className="header__favorites-item-image">
                        <img src={imgSrc} alt={title} />
                      </div>
                      <div className="header__favorites-item-content">
                        <div className="header__favorites-item-title">
                          <Link
                            to={`/tin-dang/${id}`}
                            onClick={() => {
                              setShowFavorites(false);
                              closeMobileMenu();
                            }}
                          >
                            {title}
                          </Link>
                        </div>
                        <div className="header__favorites-item-actions">
                          <button
                            className="header__favorites-item-remove"
                            onClick={() => handleRemoveFav(f)}
                            title={t('header.removeFavorite')}
                            type="button"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className={`header__user ${mobileMenuOpen ? 'header__user--open' : ''}`}>
          <ul className="header__user-list">
            {!currentUser && (
              <>
                <li className="header__user-item">
                  <Link to="/login" className="header__user-link" onClick={closeMobileMenu}>
                    {t('header.login')}
                  </Link>
                </li>
                <li className="header__user-item">
                  <Link to="/dangky" className="header__user-link" onClick={closeMobileMenu}>
                    {t('header.register')}
                  </Link>
                </li>
              </>
            )}

            {currentUser && (
              <>
                <li className="header__user-item header__user-item--username">
                  {t('header.hello')}:{" "}
                  {currentUser.TenDayDu ??
                    currentUser.name ??
                    `ID:${currentUser.NguoiDungID}`}
                </li>
                <li className="header__user-item">
                  <button
                    onClick={handleLogout}
                    className="header__user-logout"
                    type="button"
                  >
                    {t('header.logout')}
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* <div className={`header__post-btn-wrapper ${mobileMenuOpen ? 'header__post-btn-wrapper--open' : ''}`}>
          <button className="header__post-btn" type="button" onClick={closeMobileMenu}>
            {t('header.postAd')}
          </button>
        </div> */}
      </div>
    </header>
    </>
  );
}

export default Header;
