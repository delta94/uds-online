import React, {FC, useEffect} from "react";
import {ITaskWidget} from "../helpers/models";

export const WidgetCompareOptions: FC<ITaskWidget> = ({data, onJsonUpdate}) => {

    useEffect(() => {
        if (data) {
            //const parsed = decodeBase64ToObject<ITaskCompareOptions>(data);
        }
    }, []);

    return (
        <div>Compare </div>
    );
};

export default WidgetCompareOptions;