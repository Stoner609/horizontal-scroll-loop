import React from "react";
import styled from "styled-components";

function VideoElement(props) {
	const [rgbaColor, setgbaColor] = React.useState(() => {
		const r = Math.floor(Math.random() * 255);
		const g = Math.floor(Math.random() * 255);
		const b = Math.floor(Math.random() * 255);
		return `rgba(${r},${g},${b},0.8)`;
	});

	return (
		<div
			onMouseDown={(event) => {
				event.preventDefault();
			}}
			onClick={props.click}
			style={{
				backgroundColor: `${rgbaColor}`,
				margin: "0px 6px",
				width: "320px",
				height: "200px",
			}}
		>
			{props.value.name}
		</div>
	);
}

function Swipeable(props) {
	const { onSwipeStart, onSwiping, onSwipeEnd } = props;
	const setRef = React.useRef();
	const startX = React.useRef(0);
	const endX = React.useRef(0);
	const startTime = React.useRef(0);
	const isStarted = React.useRef(false);
	const isDragging = React.useRef(false);

	const _onSwipeStart = React.useRef(onSwipeStart);
	const _onSwiping = React.useRef(onSwiping);
	const _onSwipeEnd = React.useRef(onSwipeEnd);

	const getVelocity = ({ deltaX = 0, deltaY = 0, deltaTime = 0 }) => ({
		velocityX: Math.abs(deltaX) / deltaTime,
		velocityY: Math.abs(deltaY) / deltaTime,
	});

	const getDirection = ({ deltaX = 0, deltaY = 0 }) => {
		const isHorizontalSwipe = Math.abs(deltaX) >= Math.abs(deltaY);

		if (isHorizontalSwipe) {
			const isSwipeLeft = deltaX < 0;
			return isSwipeLeft ? "DIRECTION_LEFT" : "DIRECTION_RIGHT";
		}

		const isSwipeDown = deltaY < 0;
		return isSwipeDown ? "DIRECTION_DOWN" : "DIRECTION_UP";
	};

	const start = ({ x }) => {
		startX.current = x;
		endX.current = x;
		isStarted.current = true;
	};

	const move = React.useCallback(({ x: endXX }) => {
		if (!isStarted.current) return;

		const deltaX = endXX - startX.current;

		if (!isDragging.current) {
			if (Math.abs(deltaX) >= 10) {
				isDragging.current = true;
				startTime.current = Date.now();
				return _onSwipeStart.current();
			}
			return;
		}

		endX.current = endXX;

		const deltaTime = Date.now() - startTime.current;
		const { velocityX } = getVelocity({ deltaX, deltaTime });
		const direction = getDirection({ deltaX });

		return _onSwiping.current({
			deltaX,
			velocityX,
			direction,
		});
	}, []);

	const end = React.useCallback(() => {
		isStarted.current = false;

		if (!isDragging.current) return;

		const deltaX = endX.current - startX.current;
		const deltaTime = Date.now() - startTime.current;
		const { velocityX } = getVelocity({ deltaX, deltaTime });
		const direction = getDirection({ deltaX });

		startX.current = 0;
		endX.current = 0;
		startTime.current = 0;
		isDragging.current = false;

		return _onSwipeEnd.current({
			deltaX,
			velocityX,
			direction,
		});
	}, []);

	const handleTouchStart = React.useCallback((event) => {
		// console.log('touchstart');
		const [touch] = event.changedTouches;
		start({ x: touch.pageX });
	}, []);

	const handleTouchMove = React.useCallback(
		(event) => {
			// console.log('touchmove');
			if (isDragging.current) {
				event.preventDefault();
			}
			const [touch] = event.changedTouches;
			move({ x: touch.pageX });
		},
		[move]
	);

	const handleTouchEnd = React.useCallback(
		(event) => {
			const [touch] = event.changedTouches;
			end({ x: touch.pageX });
		},
		[end]
	);

	React.useEffect(() => {
		const element = setRef;
		document.addEventListener("mousemove", () => {
			console.log("mousemove");
		});
		document.addEventListener("mouseup", () => {
			console.log("mouseup");
		});
		document.addEventListener("touchmove", handleTouchMove, {
			passive: false,
		});
		document.addEventListener("touchend", handleTouchEnd);

		if (element.current) {
			element.current.addEventListener("mousedown", () => {
				console.log("mousedown");
			});
			element.current.addEventListener("touchstart", handleTouchStart);
		}
		return () => {
			document.removeEventListener("mousemove", () => {});
			document.removeEventListener("mouseup", () => {});
			document.removeEventListener("touchmove", () => {});
			document.removeEventListener("touchend", () => {});

			if (element.current) {
				element.current.removeEventListener("mousedown", () => {});
				element.current.removeEventListener("touchstart", () => {});
			}
		};
	}, [handleTouchStart, handleTouchMove, handleTouchEnd]);

	return <StyledSwipeable ref={setRef}>{props.children}</StyledSwipeable>;
}

function HorizontalScroll() {
	const listingWidth =
		itemAmount * itemWidth +
		(itemAmount - 1) * showcaseItemGap +
		showcaseContainerGap * 2;

	const [isSwiping, setIsSwiping] = React.useState(false);
	const [isTransitionStart, setIsTransitionStart] = React.useState(false);
	const [deltaX, setDeltaX] = React.useState(0);
	// const [direction, setDirection] = React.useState("");
	const direction = React.useRef("");
	const frameId = React.useRef(null);
	const transitionTimer = React.useRef(null);

	const [activeIndex, setActiveIndex] = React.useState(2);

	// const [videoList, setVideoList] = React.useState(fakeApi.video);
	const [videoList, setVideoList] = React.useState([
		{ name: "Hunter" },
		{ name: "Bonnie" },
		{ name: "Stoner" },
		{ name: "Rossi" },
		{ name: "Brown" },
	]);

	const frameHandler = (data) => {
		setDeltaX(data);
	};

	const handleSwipeStart = () => {
		setIsSwiping(true);
	};

	const handleSwiping = ({ deltaX: _deltaX, direction: _direction }) => {
		console.log(_deltaX);
		cancelAnimationFrame(frameId.current);

		frameId.current = requestAnimationFrame(() => frameHandler(_deltaX));

		if (_direction !== direction.current) {
			return (direction.current = _direction);
		}
	};

	const handleSwipeEnd = ({ deltaX, velocityX }) => {
		// const activeIndex = 0;
		// const nextIndex = direction === 'DIRECTION_LEFT' ? activeIndex + 1 : activeIndex - 1;
		// const shouldChangeIndex = Math.abs(deltaX) >= (itemWidth + showcaseItemGap) / 2 || velocityX > 1;
		const shouldChangeIndex =
			Math.abs(deltaX) >= (itemWidth + showcaseItemGap) / 2;
		setIsSwiping(false);
		setIsTransitionStart(true);

		if (shouldChangeIndex) {
			const newDeltaX =
				(direction.current === "DIRECTION_LEFT" ? -1 : 1) *
				(itemWidth + showcaseItemGap);

			frameId.current = requestAnimationFrame(() =>
				frameHandler(newDeltaX)
			);
			transitionTimer.current = setTimeout(() => {
				console.log("change");
				setActiveIndex((prevState) => {
					console.log(prevState);
					return direction.current === "DIRECTION_LEFT"
						? prevState + 1
						: prevState - 1;
				});
				setVideoList((prevState) => {
					const newState = [...prevState];
					if (direction.current === "DIRECTION_LEFT") {
						newState.push(newState.shift());
					} else {
						newState.unshift(newState.pop());
					}
					return newState;
				});
			}, showcaseSwipeTransitionSeconds * 1000);
		} else {
			frameId.current = requestAnimationFrame(() => frameHandler(0));
			transitionTimer.current = setTimeout(() => {
				setIsTransitionStart(false);
			}, showcaseSwipeTransitionSeconds * 1000);
		}
	};

	React.useEffect(() => {
		setIsTransitionStart(false);
		setDeltaX(0);
	}, [activeIndex]);

	return (
		<StyledHomeShowcaseList>
			<SwipeableWrapper>
				<Swipeable
					onSwipeStart={handleSwipeStart}
					onSwiping={handleSwiping}
					onSwipeEnd={handleSwipeEnd}
				>
					<ShowcaseList
						listingWidth={listingWidth}
						hasTransition={isTransitionStart}
						deltaX={deltaX}
					>
						{videoList.map((e, i) => (
							<VideoElement key={i} value={e} />
						))}
					</ShowcaseList>
				</Swipeable>
			</SwipeableWrapper>
		</StyledHomeShowcaseList>
	);
}

const StyledHomeShowcaseList = styled.div`
	position: relative;
	margin-bottom: 16px;
`;

const SwipeableWrapper = styled.div`
	overflow: hidden;
`;

const StyledSwipeable = styled.div`
	width: 100%;
`;

const showcaseSwipeTransitionSeconds = 0.6;
const itemAmount = 5;
// const itemWidth = 320;
const itemWidth = 275;
const showcaseItemGap = 12;
const showcaseContainerGap = 12;

const ShowcaseList = styled.div.attrs(
	({ deltaX = 0, listingWidth, hasTransition = false }) => ({
		style: {
			transform: `translate3d(calc((100vw - ${listingWidth}px) * 0.5 + ${deltaX}px), 0px, 0px)`,
			transition: `transform ${
				hasTransition ? `${showcaseSwipeTransitionSeconds}s` : "0s"
			}`,
			width: `${listingWidth}px`,
		},
	})
)`
	display: flex;
	flex-wrap: nowrap;
	will-change: transform;
	::before {
		content: "";
		width: ${showcaseContainerGap / 2}px;
		flex: none;
	}
	::after {
		content: "";
		width: ${showcaseContainerGap / 2}px;
		flex: none;
	}
`;

export default HorizontalScroll;
