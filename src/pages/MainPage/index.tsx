'use client';

import { api } from '@/shared/api/api';
import { Button } from '@/shared/assets/ui/Button/Button';
import { Card } from '@/shared/assets/ui/Card/Card';
import { Input } from '@/shared/assets/ui/Input/Input';
import { useNotification } from '@/shared/assets/ui/Notification/NotificationProvider';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './MainPage.module.scss';

export const MainPage: React.FC = () => {
	const [username, setUsername] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const { showNotification } = useNotification();

	useEffect(() => {
		const token = localStorage.getItem('authToken');
		if (token) {
			setIsAuthenticated(true);
		}
	}, []);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!username.trim()) {
			showNotification('Please enter a username', 'error');
			return;
		}

		try {
			setIsLoading(true);
			await api.auth(username);
			setIsAuthenticated(true);
			showNotification('Authentication successful', 'success');
		} catch (error) {
			showNotification('Authentication failed', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem('authToken');
		setIsAuthenticated(false);
		showNotification('Logged out successfully', 'info');
	};

	return (
		<div className={styles.mainPage}>
			<div className={styles.hero}>
				<h1>Welcome!</h1>
			</div>

			{!isAuthenticated ? (
				<Card className={styles.authCard}>
					<h2>Authentication</h2>
					<form onSubmit={handleLogin} className={styles.authForm}>
						<Input label='Username' value={username} onChange={e => setUsername(e.target.value)} placeholder='Enter your username' />
						<Button type='submit' fullWidth disabled={isLoading}>
							{isLoading ? 'Authenticating...' : 'Login'}
						</Button>
					</form>
				</Card>
			) : (
				<div className={styles.dashboard}>
					<Card className={styles.dashboardCard}>
						<h2>Dashboard</h2>
						<div className={styles.links}>
							<Link to='/company/12' className={styles.link}>
								<Button variant='outline' fullWidth>
									View Company Details
								</Button>
							</Link>
							<Link to='/contact/16' className={styles.link}>
								<Button variant='outline' fullWidth>
									View Contact Details
								</Button>
							</Link>
						</div>
						<Button variant='flat' onClick={handleLogout} className={styles.logoutButton}>
							Logout
						</Button>
					</Card>
				</div>
			)}
		</div>
	);
};
