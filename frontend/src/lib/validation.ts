export type ValidationErrors<T extends string> = Partial<Record<T, string>>;

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function required(value: string, label: string): string | null {
  return value.trim() ? null : `${label} is required.`;
}

export function maxLength(value: string, label: string, max: number): string | null {
  return value.trim().length <= max ? null : `${label} must be ${max} characters or fewer.`;
}

export function minLength(value: string, label: string, min: number): string | null {
  return value.trim().length >= min ? null : `${label} must be at least ${min} characters.`;
}

export function validateLogin(values: { email: string; password: string }) {
  const errors: ValidationErrors<'email' | 'password'> = {};

  const emailRequired = required(values.email, 'Email');
  if (emailRequired) {
    errors.email = emailRequired;
  } else if (!isEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  const passwordRequired = required(values.password, 'Password');
  if (passwordRequired) {
    errors.password = passwordRequired;
  }

  return errors;
}

export function validateRegister(values: {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
}) {
  const errors: ValidationErrors<'fullName' | 'email' | 'password' | 'phoneNumber' | 'address'> = {};

  const fullNameRequired = required(values.fullName, 'Full name');
  if (fullNameRequired) {
    errors.fullName = fullNameRequired;
  } else {
    const fullNameLength = maxLength(values.fullName, 'Full name', 100);
    if (fullNameLength) {
      errors.fullName = fullNameLength;
    }
  }

  const emailRequired = required(values.email, 'Email');
  if (emailRequired) {
    errors.email = emailRequired;
  } else if (!isEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  const passwordRequired = required(values.password, 'Password');
  if (passwordRequired) {
    errors.password = passwordRequired;
  } else {
    const passwordLength = minLength(values.password, 'Password', 6) ?? maxLength(values.password, 'Password', 100);
    if (passwordLength) {
      errors.password = passwordLength;
    }
  }

  if (values.phoneNumber.trim()) {
    const phoneLength = maxLength(values.phoneNumber, 'Phone number', 30);
    if (phoneLength) {
      errors.phoneNumber = phoneLength;
    }
  }

  if (values.address.trim()) {
    const addressLength = maxLength(values.address, 'Address', 255);
    if (addressLength) {
      errors.address = addressLength;
    }
  }

  return errors;
}

export function validateRequest(values: { title: string; description: string }) {
  const errors: ValidationErrors<'title' | 'description'> = {};

  const titleRequired = required(values.title, 'Title');
  if (titleRequired) {
    errors.title = titleRequired;
  } else {
    const titleLength = maxLength(values.title, 'Title', 255);
    if (titleLength) {
      errors.title = titleLength;
    }
  }

  const descriptionRequired = required(values.description, 'Description');
  if (descriptionRequired) {
    errors.description = descriptionRequired;
  }

  return errors;
}

export function validateProfile(values: { fullName: string; phoneNumber: string; address: string }) {
  const errors: ValidationErrors<'fullName' | 'phoneNumber' | 'address'> = {};

  const fullNameRequired = required(values.fullName, 'Full name');
  if (fullNameRequired) {
    errors.fullName = fullNameRequired;
  } else {
    const fullNameLength = maxLength(values.fullName, 'Full name', 100);
    if (fullNameLength) {
      errors.fullName = fullNameLength;
    }
  }

  if (values.phoneNumber.trim()) {
    const phoneLength = maxLength(values.phoneNumber, 'Phone number', 30);
    if (phoneLength) {
      errors.phoneNumber = phoneLength;
    }
  }

  if (values.address.trim()) {
    const addressLength = maxLength(values.address, 'Address', 255);
    if (addressLength) {
      errors.address = addressLength;
    }
  }

  return errors;
}

export function validateService(values: {
  title: string;
  description: string;
  conditions: string;
  requiredDocuments: string;
}) {
  const errors: ValidationErrors<'title' | 'description' | 'conditions' | 'requiredDocuments'> = {};

  (['title', 'description', 'conditions', 'requiredDocuments'] as const).forEach((field) => {
    const label = field === 'requiredDocuments' ? 'Required documents' : field[0].toUpperCase() + field.slice(1);
    const error = required(values[field], label);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}
