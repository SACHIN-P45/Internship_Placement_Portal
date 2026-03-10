import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheck, FaInfoCircle, FaCheckCircle, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

const NotificationDropdown = ({ isSidebar = false }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data } = await getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Polling every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (e, id) => {
        e.stopPropagation();
        try {
            await markAsRead(id);
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleMarkAllAsRead = async (e) => {
        e.stopPropagation();
        try {
            await markAllAsRead();
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            await markAsRead(notif._id);
            fetchNotifications();
        }
        setIsOpen(false);
        if (notif.link) {
            navigate(notif.link);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <FaCheckCircle className="text-success" />;
            case 'error': return <FaTimesCircle className="text-danger" />;
            case 'warning': return <FaExclamationCircle className="text-warning" />;
            default: return <FaInfoCircle className="text-info" />;
        }
    };

    return (
        <div className="notification-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                className="btn btn-link nav-link position-relative p-2 d-flex align-items-center justify-content-center"
                onClick={() => setIsOpen(!isOpen)}
                style={{ color: isSidebar ? '#94a3b8' : 'inherit', border: 'none', background: 'transparent' }}
            >
                <FaBell size={18} />
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="notification-dropdown dropdown-menu show shadow"
                    style={{
                        position: 'absolute',
                        right: isSidebar ? 'auto' : 0,
                        left: isSidebar ? '100%' : 'auto',
                        top: isSidebar ? '0' : '40px',
                        width: '320px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        zIndex: 1050,
                        padding: 0,
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(0,0,0,0.1)'
                    }}
                >
                    <div className="dropdown-header d-flex justify-content-between align-items-center bg-light border-bottom p-3">
                        <h6 className="m-0 fw-bold text-dark">Notifications</h6>
                        {unreadCount > 0 && (
                            <button className="btn btn-sm btn-link text-decoration-none p-0" onClick={handleMarkAllAsRead}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-muted small">No notifications yet</div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    className={`dropdown-item p-3 border-bottom ${!notif.isRead ? 'bg-light' : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                    style={{ cursor: 'pointer', whiteSpace: 'normal', transition: 'background-color 0.2s' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = !notif.isRead ? '#f8f9fa' : 'transparent'; }}
                                >
                                    <div className="d-flex align-items-start gap-2">
                                        <div className="mt-1">{getIcon(notif.type)}</div>
                                        <div className="flex-grow-1">
                                            <p className="mb-1 small text-wrap" style={{ color: !notif.isRead ? '#212529' : '#6c757d', fontWeight: !notif.isRead ? '500' : 'normal', lineHeight: '1.4' }}>{notif.message}</p>
                                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                {new Date(notif.createdAt).toLocaleString()}
                                            </small>
                                        </div>
                                        {!notif.isRead && (
                                            <button
                                                className="btn btn-sm btn-link p-0 text-muted ms-2"
                                                onClick={(e) => handleMarkAsRead(e, notif._id)}
                                                title="Mark as read"
                                            >
                                                <FaCheck size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
