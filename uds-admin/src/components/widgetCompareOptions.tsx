import React, {FC, useEffect} from "react";
import {ITaskCompareOptions, ITaskWidget} from "../helpers/models";
import {decodeBase64ToObject} from "../helpers";

export const WidgetCompareOptions: FC<ITaskWidget> = ({data, onJsonUpdate}) => {

    useEffect(() => {
        if (data) {
            const parsed = decodeBase64ToObject<ITaskCompareOptions>(data);
        }
    }, []);

    return (
        <div>Compare </div>
    );
};

export default WidgetCompareOptions;