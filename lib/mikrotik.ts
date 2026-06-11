import MikroTik from 'mikrotik-node';

const device = new MikroTik({
  host: process.env.MIKROTIK_HOST || '192.168.88.1',
  user: process.env.MIKROTIK_USER || 'admin',
  password: process.env.MIKROTIK_PASSWORD || '',
  port: 8728
});

export default device;