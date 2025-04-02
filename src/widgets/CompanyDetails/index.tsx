'use client';

import { api } from '@/shared/api/api';
import { Button } from '@/shared/assets/ui/Button/Button';
import { Card } from '@/shared/assets/ui/Card/Card';
import { Input } from '@/shared/assets/ui/Input/Input';
import { useNotification } from '@/shared/assets/ui/Notification/NotificationProvider';
import { Selector } from '@/shared/assets/ui/Selector/Selector';
import type { CompanyType } from '@/shared/types';
import type React from 'react';
import { useEffect, useState } from 'react';
import styles from './CompanyDetails.module.scss';

interface CompanyDetailsProps {
	company: CompanyType;
	onUpdate: (updatedCompany: CompanyType) => void;
}

export const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company, onUpdate }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState<Partial<CompanyType>>({
		name: company.name,
		shortName: company.shortName,
		businessEntity: company.businessEntity,
		contract: {
			no: company.contract.no,
			issue_date: company.contract.issue_date,
		},
		type: company.type,
	});
	const [isLoading, setIsLoading] = useState(false);
	const { showNotification } = useNotification();
	useEffect(() => {
		console.log('Company prop changed in CompanyDetails:', company);
		setFormData({
			name: company.name,
			shortName: company.shortName,
			businessEntity: company.businessEntity,
			contract: {
				no: company.contract.no,
				issue_date: company.contract.issue_date,
			},
			type: company.type,
		});
	}, [company]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name.includes('.')) {
			const [parent, child] = name.split('.');
			setFormData(prev => {
				const parentObj = prev[parent as keyof typeof prev] || {};
				return {
					...prev,
					[parent]: {
						...(typeof parentObj === 'object' ? parentObj : {}),
						[child]: value,
					},
				};
			});
		} else {
			setFormData(prev => ({ ...prev, [name]: value }));
		}
	};

	const handleSave = async () => {
		try {
			setIsLoading(true);

			const changedFields: Partial<CompanyType> = {};

			if (formData.name !== company.name) {
				changedFields.name = formData.name;
			}

			if (formData.shortName !== company.shortName) {
				changedFields.shortName = formData.shortName;
			}

			if (formData.businessEntity !== company.businessEntity) {
				changedFields.businessEntity = formData.businessEntity;
			}

			if (formData.contract) {
				const contractChanged = formData.contract.no !== company.contract.no || formData.contract.issue_date !== company.contract.issue_date;

				if (contractChanged) {
					changedFields.contract = {
						no: formData.contract.no || company.contract.no,
						issue_date: formData.contract.issue_date || company.contract.issue_date,
					};
				}
			}

			console.log('Sending data to API:', changedFields);

			if (Object.keys(changedFields).length === 0) {
				showNotification('No changes to save', 'info');
				setIsEditing(false);
				return;
			}

			await api.updateCompany(company.id, changedFields);

			const localUpdatedCompany = {
				...company,
				...changedFields,
				contract: changedFields.contract ? { ...company.contract, ...changedFields.contract } : company.contract,
			};

			console.log('Local updated company:', localUpdatedCompany);

			onUpdate(localUpdatedCompany);

			console.log('Company updated successfully with local data');

			setIsEditing(false);
			showNotification('Company details updated successfully', 'success');
		} catch (error) {
			console.error('Update error:', error);
			showNotification('Failed to update company details', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setFormData({
			name: company.name,
			shortName: company.shortName,
			businessEntity: company.businessEntity,
			contract: {
				no: company.contract.no,
				issue_date: company.contract.issue_date,
			},
			type: company.type,
		});
		setIsEditing(false);
	};

	const businessEntityOptions = [
		{ value: 'Individual', label: 'Individual' },
		{ value: 'LLC', label: 'LLC' },
		{ value: 'Partnership', label: 'Partnership' },
		{ value: 'Corporation', label: 'Corporation' },
	];

	const typeOptions = [
		{ value: 'funeral_home', label: 'Funeral Home' },
		{ value: 'logistics_services', label: 'Logistics Services' },
		{ value: 'cemetery', label: 'Cemetery' },
		{ value: 'crematorium', label: 'Crematorium' },
	];

	return (
		<Card className={styles.companyDetails}>
			<div className={styles.header}>
				<h2 className={styles.title}>Company Details</h2>
				{!isEditing ? (
					<Button onClick={() => setIsEditing(true)}>Edit</Button>
				) : (
					<div className={styles.actions}>
						<Button variant='outline' onClick={handleCancel}>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={isLoading}>
							{isLoading ? 'Saving...' : 'Save'}
						</Button>
					</div>
				)}
			</div>

			<div className={styles.content}>
				{isEditing ? (
					<div className={styles.form}>
						<Input label='Company Name' name='name' value={formData.name || ''} onChange={handleInputChange} />
						<Input label='Short Name' name='shortName' value={formData.shortName || ''} onChange={handleInputChange} />
						<Selector
							label='Business Entity'
							options={businessEntityOptions}
							value={formData.businessEntity}
							onChange={value => setFormData(prev => ({ ...prev, businessEntity: value }))}
						/>
						<Input label='Contract Number' name='contract.no' value={formData.contract?.no || ''} onChange={handleInputChange} />
						<Input
							label='Contract Issue Date'
							name='contract.issue_date'
							type='date'
							value={formData.contract?.issue_date?.split('T')[0] || ''}
							onChange={handleInputChange}
						/>
					</div>
				) : (
					<div className={styles.details}>
						<div className={styles.detailItem}>
							<span className={styles.label}>Company Name:</span>
							<span className={styles.value}>{company.name}</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.label}>Short Name:</span>
							<span className={styles.value}>{company.shortName}</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.label}>Business Entity:</span>
							<span className={styles.value}>{company.businessEntity}</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.label}>Contract Number:</span>
							<span className={styles.value}>{company.contract.no}</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.label}>Contract Issue Date:</span>
							<span className={styles.value}>{new Date(company.contract.issue_date).toLocaleDateString()}</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.label}>Company Type:</span>
							<span className={styles.value}>{company.type.map(t => typeOptions.find(opt => opt.value === t)?.label || t).join(', ')}</span>
						</div>
					</div>
				)}
			</div>
		</Card>
	);
};
