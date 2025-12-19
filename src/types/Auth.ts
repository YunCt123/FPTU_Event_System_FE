export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateAccountRequest {
    userName: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gender: boolean;
    address: string;
    avatar: string;
}