import React from "react";
import { NavLink } from 'react-router-dom'

import {
    CCloseButton,
    CSidebar,
    CSidebarBrand,
    CSidebarFooter,
    CSidebarHeader,
    CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'
import { useSidebar } from "../contexts/SidebarContext"
import { getAllowedScreens } from "/src/utils/auth"

import logo from "../assets/images/CM-logo.png"
import { sygnet } from "../assets/brand/sygnet"

// sidebar nav config
import { getFilteredNav } from '../_nav'

const AppSidebar = () => {
    const { sidebarShow, setSidebarShow, unfoldable, setUnfoldable } = useSidebar();

    // Recomputed on every render, which is fine here — it's a cheap filter
    // over a small static array, and guarantees it reflects whatever's
    // currently in sessionStorage rather than a stale snapshot from mount.
    const navigation = getFilteredNav(getAllowedScreens());

    return (
        <CSidebar
            className="border-end"
            colorScheme="light"
            position="fixed"
            unfoldable={unfoldable}
            visible={sidebarShow}
            onVisibleChange={setSidebarShow}
        >
            <CSidebarHeader className="border-bottom">
                <CSidebarBrand >
                    <img
                        src={logo}
                        alt="Smart Warehouse"
                        style={{
                            width: "220px",
                            height: "79px"


                        }}
                    />
                </CSidebarBrand>
                <CCloseButton
                    className="d-lg-none"
                    onClick={() => setSidebarShow(false)}
                />
            </CSidebarHeader>
            <AppSidebarNav items={navigation} />
            <CSidebarFooter className="border-top d-none d-lg-flex">
                <CSidebarToggler
                    onClick={() => setUnfoldable(!unfoldable)}
                />
            </CSidebarFooter>
        </CSidebar>
    )
}

export default React.memo(AppSidebar)