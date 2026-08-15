import type { SvgIconProps } from '@mui/material/SvgIcon';
import { ICON_MAP } from '../../../constants/icons';
import { useConfig } from '../../../providers/ConfigProvider';

interface Props extends SvgIconProps {
  name: keyof typeof ICON_MAP;
}

export default function MaterialIcon({ name, ...props }: Props) {
  const [config] = useConfig();
  const Element = ICON_MAP[name][Number(config.sharpStyle)];

  return <Element {...props} />;
}
