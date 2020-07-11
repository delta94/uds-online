import React, {FC, useEffect} from "react";
import {ITaskFillGaps, ITaskWidget} from "../helpers/models";
import {decodeBase64ToObject} from "../helpers";

export const WidgetFillGaps: FC<ITaskWidget> = ({data, onJsonUpdate}) => {

    useEffect(() => {
        if (data) {
            const parsed = decodeBase64ToObject<ITaskFillGaps>(data);
        }
    }, []);


    return (
        <div>Fill gaps </div>
    );
};

export default WidgetFillGaps;