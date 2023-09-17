select dub1.host_id as [Host ID] , dub1.preferred_or_first_name as [Preferred or First Name] , dub1.lastname as [Last Name] , dub1.email as [E-Mail] from
dbo.da_user_base(@p1)dub1 INNER JOIN dbo.da_user_role(@p1)dur1 ON dur1.user_id = dub1.user_id
where dur1.role IN (select [value] from dbo.fn_convertlisttosetstr('Faculty,Non-Teaching Staff',','))
