// @ts-ignore
import doiuse from 'doiuse';

export default {
  plugins: {
    autoprefixer: {},
    doiuse: doiuse({
      onFeatureUsage: (usageInfo: any) => {
        console.warn(usageInfo.message);
      },
    }),
  },
};
