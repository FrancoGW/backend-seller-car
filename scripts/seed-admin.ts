/**
 * Script para crear el usuario administrador.
 * Ejecutar: npm run seed:admin
 * Requiere MONGODB_URI en .env
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'ivan@stuntargentino.com';
const ADMIN_PASSWORD = 'Stunt2025!';

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI no está definida en .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: 'StuntArgentinoCars' });
    console.log('✅ Conectado a MongoDB');

    const usersCollection = mongoose.connection.collection('users');
    const existing = await usersCollection.findOne({ email: ADMIN_EMAIL });

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    if (existing) {
      await usersCollection.updateOne(
        { email: ADMIN_EMAIL },
        { $set: { passwordHash, role: 'admin', name: 'Admin' } },
      );
      console.log('✅ Usuario admin actualizado:', ADMIN_EMAIL);
    } else {
      await usersCollection.insertOne({
        email: ADMIN_EMAIL,
        name: 'Admin',
        passwordHash,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ Usuario admin creado:', ADMIN_EMAIL);
    }

    console.log('🎉 Listo. Podés iniciar sesión con:', ADMIN_EMAIL);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
