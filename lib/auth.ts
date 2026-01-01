// In lib/auth.ts → inside providers array
Credentials({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) return null;

    const client = await clientPromise;
    const users = client.db().collection('users');

    const user = await users.findOne({ email: credentials.email.toLowerCase() });

    if (!user || !user.password) return null;

    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) return null;

    // Block unvalidated teachers
    if (user.role === 'teacher' && !user.isValidated) {
      throw new Error("Teacher account pending approval");
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isValidated: user.isValidated,
      adSkipping: user.adSkipping,
    };
  },
}),