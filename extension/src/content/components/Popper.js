import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';


const Div = styled.div`
  position: fixed !important;
  z-index: 99999;
  width: 0 !important;
`;

function checkContains(a, b) {
  try {
    if (a.contains(b)) {
      return true;
    }
  } catch (e) { }
  return false;
}


function Popper(props, ref) {
  let timer;
  const {
    trigger = 'click',
    children,
    delay = 300,
    onMouseEnter = () => { },
    onMouseLeave = () => { },
    component = () => { },
    placement = 'bottom',
    onChange = () => { },
    ...rest
  } = props;
  const [showPopover, setShowPopover] = useState(false);
  const childNode = useRef(null);
  const popperNode = useRef(null);
  const [eleID] = useState(uuidv4());
  const [pos, setPos] = useState({});

  useImperativeHandle(ref, () => ({
    setShowPopover
  }));

  useEffect(() => {
    if (trigger === 'hover') {
      document.body.addEventListener('mouseover', triggerMouseover);
    } else {
      document.body.addEventListener('click', triggerClick);
    }

    return () => {
      document.body.removeEventListener('mouseover', triggerMouseover);
      document.body.removeEventListener('click', triggerClick);
    };
  }, []);

  useEffect(() => {
    if (trigger === 'hover') {
      if (showPopover) {
        onMouseEnter();
      } else {
        onMouseLeave();
      }
    }
  }, [showPopover]);

  useEffect(() => {
    onChange(showPopover);
  }, [showPopover]);

  function triggerClick(event) {
    const { clientX: left, clientY: top } = event;
    console.log(event.target);
    const height = event?.target?.clientHeight || 0;
    const width = event?.target?.clientWidth || 0;

    const el1 = childNode?.current;
    const el2 = document.getElementById(eleID);
    const { target } = event;
    const isInSide = checkContains(el1, target) || checkContains(el2, target);

    setPos({ left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` });

    if (isInSide) {
      setShowPopover(true);
    } else {
      setShowPopover(false);
    }
  }

  function triggerMouseover(event) {
    const el1 = childNode?.current;
    const el2 = popperNode?.current;
    const { target } = event;
    const isInSide = checkContains(el1, target) || checkContains(el2, target);

    clearTimeout(timer);
    if (isInSide) {
      timer = setTimeout(() => {
        setShowPopover(true);
      }, delay);
    } else {
      timer = setTimeout(() => {
        setShowPopover(false);
      }, delay);
    }
  }

  console.log(childNode);

  return (
    <>
      <div
        ref={childNode}
        style={{ position: 'fixed', ...pos, zIndex: 99999 }}
      />
      <Overlay
        show={showPopover}
        placement={placement}
        target={childNode}
        shouldUpdatePosition
      >
        <Div
          width={rest.width}
          height={rest.height}
          id={eleID}
        >
          {component({ setOpen: setShowPopover })}
        </Div>
      </Overlay>
    </>
  );
}

export default forwardRef(Popper);
