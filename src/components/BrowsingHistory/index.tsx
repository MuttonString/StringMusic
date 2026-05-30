import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { PopoverVirtualElement } from '@mui/material/Popover';
import useDetailHistory from '../../hooks/useDetailHistory';

interface IProps {
  isBack: boolean;
  anchorEl:
    | Element
    | PopoverVirtualElement
    | (() => Element | PopoverVirtualElement | null)
    | null
    | undefined;
  onClose: () => void;
}

export default function BrowsingHistory(props: IProps) {
  const { isBack, anchorEl, onClose } = props;
  const { prev, next, goBack, goForward } = useDetailHistory();
  return (
    <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={onClose}>
      {(isBack ? [...prev].reverse() : next).map((item, index) => (
        <MenuItem
          key={index}
          onClick={() => {
            if (isBack) {
              goBack(index + 1);
            } else {
              goForward(index + 1);
            }
            onClose();
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText>{item.title}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
}
