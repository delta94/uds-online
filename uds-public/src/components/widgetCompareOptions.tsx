import React, {FC, useEffect, useState} from "react";
import {
	IAnswerCompareOptions,
	ITaskCompareOptions,
	ITaskWidget,
	NullableTaskOption,
	SelectionPair
} from "../helpers/models";
import {Delete} from '@material-ui/icons';
import clsx from "clsx";
import {Paper, Typography} from "@material-ui/core";
import {HTML5Backend} from "react-dnd-html5-backend";
import {cloneDeep, shuffle} from "lodash";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {decodeBase64ToObject, encodeObjectToBase64} from "../helpers";
import {
	ConnectDragSource,
	ConnectDropTarget,
	DndProvider,
	DragSource,
	DragSourceConnector,
	DragSourceMonitor,
	DropTarget,
	DropTargetConnector,
	DropTargetMonitor
} from 'react-dnd';


const TYPE_PREFIX = 'BOX';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		option: {
			display: 'inline-block',
			padding: 5,
			marginRight: 5,
			marginBottom: 5
		},
		slot: {
			height: '1rem',
			width: 100,
			border: '1px dashed #cecece',
			borderRadius: 3
		},
		lineThrough: {
			textDecoration: 'line-through',
		},
		redText: {
			color: 'red',
		},
		correct: {
			color: 'green',
		},
		pointer: {
			cursor: 'pointer',
		},
		answer: {
			fontWeight: 'bold',
			display: 'inline-block',
			margin: '0 5px',
		},
		row: {
			display: 'flex'
		},
		grow: {
			flexGrow: 2
		}
	})
);


interface DropResult {
	dzId: number,
	dzText: string,
	boxId?: number,
	boxText?: string,
}

export interface BoxProps {
	id: number,
	option: string,
	// Collected Props
	isDragging: boolean
	connectDragSource: ConnectDragSource
}

export interface DZoneProps {
	id: number,
	option: string,
	canDrop: boolean,
	isOver: boolean,
	connectDropTarget: ConnectDropTarget,
	onDone: (data: DropResult) => void,
}

export const WidgetCompareOptions: FC<ITaskWidget<any>> = ({data, givenAnswer, onUpdate}) => {
	const [prefix] = useState(TYPE_PREFIX + Math.floor(Math.random() * 10000));
	const classes = useStyles();
	const [optionsA, setOptionsA] = useState<NullableTaskOption[]>([]);
	const [optionsB, setOptionsB] = useState<NullableTaskOption[]>([]);
	const [correctAnswers, setCorrectAnswers] = useState<SelectionPair[]>([]);
	const [selection, setSelection] = useState<SelectionPair[]>([]);
	const [text, setText] = useState<string>("");
	
	useEffect(() => {
		if (data) {
			const parsed = decodeBase64ToObject<ITaskCompareOptions>(data);
			if (parsed.text) {
				setText(parsed.text);
			}
			setOptionsA(parsed.optionsA);
			setOptionsB(shuffle(parsed.optionsB));
			setCorrectAnswers(parsed.control);
		}
	}, []);
	
	useEffect(() => {
		if (givenAnswer && givenAnswer.length > 0) {
			setSelection([...givenAnswer]);
		}
	}, [givenAnswer]);
	
	useEffect(() => {
		if (!validate() && !givenAnswer) {
			onUpdate("", null);
			return;
		}
		const t: IAnswerCompareOptions = {
			control: selection
		};
		onUpdate(encodeObjectToBase64(t), selection);
	}, [selection]);
	
	const validate = (): boolean => {
		let valid = true;
		if (!selection || !selection.length) {
			valid = false;
		}
		return valid;
	};
	
	const handleDrag = ({dzId, dzText, boxId, boxText}: DropResult) => {
		if (givenAnswer) {
			return;
		}
		if (!boxId || !boxText) {
			return;
		}
		const _selection = cloneDeep(selection);
		const existingDzEntry = _selection.find(s => s[0] === dzId);
		if (existingDzEntry) {
			const idx = _selection.indexOf(existingDzEntry);
			if (idx !== -1) {
				_selection.splice(idx, 1);
			}
		}
		const existingBoxEntry = _selection.find(s => s[1] === boxId);
		if (existingBoxEntry) {
			const idx = _selection.indexOf(existingBoxEntry);
			if (idx !== -1) {
				_selection.splice(idx, 1);
			}
		}
		const pair: SelectionPair = [dzId, boxId];
		setSelection([..._selection, pair]);
	};
	
	const checkIfSelected = (id: number): boolean => {
		return !!selection.find(s => s[0] === id);
	}
	
	const checkIfDragged = (id: number): boolean => {
		return !!selection.find(s => s[1] === id);
	}
	
	const getSelectionText = (id: number): string => {
		const selected = selection.find(s => s[0] === id);
		if (!selected) {
			return "";
		}
		const s = optionsB.find(dOpt => dOpt && dOpt.id === selected[1]);
		if (!s) {
			return "";
		}
		return s.option;
	}
	
	const cancelSelection = (id: number): void => {
		if (givenAnswer) {
			return;
		}
		const _selection = cloneDeep(selection);
		const selected = _selection.find(s => s[0] === id);
		if (!selected) {
			return
		}
		const idx = _selection.indexOf(selected);
		_selection.splice(idx, 1);
		setSelection([..._selection]);
	};
	
	const checkIfCorrect = (id: number): boolean => {
		const selectedPair = selection.find(s => s[0] === id);
		const relatedCorrectAnswer = correctAnswers.find(a => a[0] === id);
		if (!selectedPair || !relatedCorrectAnswer) {
			return false;
		}
		return selectedPair[1] === relatedCorrectAnswer[1];
	};
	
	const getCorrectAnswerText = (id: number): string => {
		const relatedCorrectAnswer = correctAnswers.find(a => a[0] === id);
		if ( !relatedCorrectAnswer) {
			return '';
		}
		const optionB = optionsB.find(o => o && o.id === relatedCorrectAnswer[1]);
		if (!optionB) {
			return '';
		}
		return optionB.option;
	}
	
	const paragraph = text ? <Typography variant='body1'>{text}</Typography> : null;
	
	
	const DTarget = DropTarget(
		prefix,
		{
			drop: (props: DZoneProps) => ({
				option: props.option,
				id: props.id,
				onDone: ({boxId, boxText}: DropResult) => {
					return props.onDone({
						dzText: props.option,
						dzId: props.id,
						boxId: boxId,
						boxText: boxText
					})
				},
			}),
		},
		(connect: DropTargetConnector, monitor: DropTargetMonitor) => ({
			connectDropTarget: connect.dropTarget(),
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	)(DZone);
	
	const DSource = DragSource(
		prefix,
		{
			beginDrag: (props: BoxProps) => ({
				option: props.option,
				id: props.id,
			}),
			endDrag(props: BoxProps, monitor: DragSourceMonitor) {
				const item = monitor.getItem()
				const dropResult = monitor.getDropResult()
				
				if (dropResult) {
					dropResult.onDone({
						boxId: item.id,
						boxText: item.option
					});
				}
			},
		},
		(connect: DragSourceConnector, monitor: DragSourceMonitor) => ({
			connectDragSource: connect.dragSource(),
			isDragging: monitor.isDragging(),
		}),
	)(Box);
	
	return (
		<>
			{paragraph}
			<br/>
			<DndProvider backend={HTML5Backend}>
				{optionsA.map(sOpt => {
					if (!sOpt) {
						return null;
					}
					return (
						<div key={sOpt.id} className={classes.row}>
							{checkIfSelected(sOpt.id) ?
								<>
									{
										givenAnswer
										&& checkIfCorrect(sOpt.id)
										&& <>{sOpt.option} <span className={classes.grow}/> <span className={clsx(classes.correct,classes.answer)}>{getSelectionText(sOpt.id)}</span></>
									}
									{
										givenAnswer
										&& !checkIfCorrect(sOpt.id)
										&& <>{sOpt.option} <span className={classes.grow}/> <span className={clsx(classes.answer)}>{getCorrectAnswerText(sOpt.id)}</span> <span className={clsx(classes.redText, classes.lineThrough)}>{getSelectionText(sOpt.id)}</span></>
									}
									{
										!givenAnswer && <>{sOpt.option}
										
											<span className={classes.grow}/> {getSelectionText(sOpt.id)} <Delete fontSize="small" className={clsx(classes.redText, classes.pointer)} onClick={() => cancelSelection(sOpt.id)} />
										</>
									}
								</>
								:
								<>
									{sOpt.option} <span className={classes.grow}/>
									{!givenAnswer && <DTarget onDone={handleDrag} id={sOpt.id} option={sOpt.option}/>}
									{
										givenAnswer
										&& <span className={clsx(classes.answer, classes.redText)}>{getCorrectAnswerText(sOpt.id)}</span>
									}
								</>
							}
						</div>
					)
				})}
				
				{!givenAnswer && optionsB.map(dOpt => {
					if (!dOpt) {
						return null;
					}
					if (checkIfDragged(dOpt.id)) return null;
					return (
						<DSource key={dOpt.id} id={dOpt.id} option={dOpt.option} />
					)
				})}
			</DndProvider>
		</>
	);
};


const Box: FC<BoxProps> = ({id, option, isDragging, connectDragSource}) => {
	const classes = useStyles();
	return (
		<Paper ref={connectDragSource} className={classes.option}>
			{option}
		</Paper>
	)
};

const DZone: React.FC<DZoneProps> = ({canDrop, isOver, connectDropTarget}) => {
	const classes = useStyles();
	const isActive = canDrop && isOver;
	let backgroundColor = '#FFFFFF';
	if (isActive) {
		 backgroundColor = '#a0a0a0';
	} else if (canDrop) {
		 backgroundColor = '#dedede';
	}
	
	return (
		<div ref={connectDropTarget} className={classes.slot}
			style={{ backgroundColor }}
		>
			{isActive ? ' ' : ' '}
		</div>
	)
}


export default WidgetCompareOptions;
