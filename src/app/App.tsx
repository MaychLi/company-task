import { CompanyPage } from '@/pages/CompanyPage';
import { ContactPage } from '@/pages/ContactPage';
import { MainPage } from '@/pages/MainPage';
import { NotificationProvider } from '@/shared/assets/ui/Notification/NotificationProvider';
import { Header } from '@/widgets/Header';
import type React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

export const App: React.FC = () => {
	return (
		<BrowserRouter>
			<NotificationProvider>
				<div className='app'>
					<Header />
					<main className='main'>
						<Routes>
							<Route path='/' element={<MainPage />} />
							<Route path='/company/:id' element={<CompanyPage />} />
							<Route path='/contact/:id' element={<ContactPage />} />
						</Routes>
					</main>
				</div>
			</NotificationProvider>
		</BrowserRouter>
	);
};
