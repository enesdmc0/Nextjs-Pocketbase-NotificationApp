import React from 'react';
import {Accordion, Tabs} from "@mantine/core";
import classes from "../pages/Global.module.css";
import AccordionItem from "./AccordionItem";

interface Props {
    notifications: any;
    value: string;
}

const TabsPanel: React.FC<Props> = ({notifications, value}) => {
    return (
        <Tabs.Panel value={value}>
            <Accordion
                 classNames={{
                     item: classes.accordionItem,
                     control: classes.accordionControl,
                 }}
                styles={{
                    label: { padding: 0},
                    content: { padding: 0},
                    chevron: { display: "none"},
                }}
            >
                {notifications.map((x: any, i: number) => (
                    <AccordionItem item={x} key={i}/>
                ))}

            </Accordion>
        </Tabs.Panel>
    );
};

export default TabsPanel;
