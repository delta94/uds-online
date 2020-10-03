import React, {FC, useEffect} from "react";
import {ITaskWidget} from "../helpers/models";

export const WidgetFillGaps: FC<ITaskWidget<any>> = ({data, onUpdate}) => {

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
