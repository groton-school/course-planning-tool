select dub1.host_id as [Host ID] , dub1.email as [Student Email] , dub1.preferred_or_first_name as [Student First Name] , dub1.lastname as [Student Last Name] , dub1.grad_year as [Grad Year] from
dbo.da_user_base(@p1)dub1 INNER JOIN dbo.da_user_role(@p1)dur1 ON dur1.user_id = dub1.user_id INNER JOIN dbo.da_user_login_security(@p1)uls1 ON uls1.user_id = dub1.user_id
where dur1.role IN (select [value] from dbo.fn_convertlisttosetstr('Student',',')) And dub1.host_id NOT LIKE '%TEST%' And dub1.host_id LIKE 'A%' And uls1.deny_type IN (select [value] from dbo.fn_convertlisttosetstr('Has Access',','))
order by dub1.grad_year DESC , dub1.lastname ASC , dub1.preferred_or_first_name ASC , dub1.email ASC
