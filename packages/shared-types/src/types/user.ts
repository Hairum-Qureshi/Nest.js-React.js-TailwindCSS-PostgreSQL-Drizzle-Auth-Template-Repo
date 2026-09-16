type UserPayload = {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	profilePicture?: string;
	createdAt: Date;
};

export type { UserPayload };
