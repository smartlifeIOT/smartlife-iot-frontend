import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from './button'

const DashboardNavigation = ({ previousRoute, nextRoute }: { previousRoute: string, nextRoute: string }) => {
    return (
        <div> <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            <NavLink to={previousRoute}>
                <Button variant="social" size="icon" type="button" >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </NavLink>
            <NavLink to={nextRoute}>
                <Button variant="social" size="icon" type="button" >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </NavLink>
        </div></div>
    )
}

export default DashboardNavigation