// const env = 'dev';
const env = 'prod';

const configs = {
  dev: {
    url: "http://10.86.255.16:8088",
    debug: true,
    version: "0.1.0-dev",
  },
  prod: {
    url: "https://onss.sctfia.com",
    debug: false,
    version: "1.0.0",
  }
};

export default configs[env];
