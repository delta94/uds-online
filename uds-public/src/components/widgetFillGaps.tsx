import React, {FC, useEffect} from "react";
import {ITaskWidget} from "../helpers/models";

export const WidgetFillGaps: FC<ITaskWidget> = ({data, onJsonUpdate}) => {

    useEffect(() => {
        if (data) {
            //const parsed = decodeBase64ToObject<ITaskFillGaps>(data);
        }
    }, []);


    return (
        <div>Fill gaps </div>
    );
};

export default WidgetFillGaps;
